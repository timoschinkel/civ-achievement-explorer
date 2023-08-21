import { css, LitElement, html, render } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CivAchievement } from './civ-achievement';
import { ifDefined } from 'lit-html/directives/if-defined.js';

type Achievement = {
    leaders: string[];
    img: string | null;
    title: string | null;
    description: string | null;
    scenario: string | null;
    civilization: string | null;
    map_size: string | null;
    difficulty: string | null;
}

@customElement('civ-achievements-filter')
class CivAchievementsFilter extends LitElement {
    @property()
    public src;

    private unlocked = {} as Record<string, boolean>;
    private pinned = {} as Record<string, boolean>;

    static styles = css`
        :host {
            --primary-color: #ff0000;
        }

        .hide {
            display: none;
        }

        .achievements {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
            grid-gap: 1rem;
            grid-auto-rows: 1fr
        }

        form {
            margin: .5rem 0;
        }

        .progress {
            margin: .5rem 0;
        }

        fieldset { container-type: inline-size; container-name: filter; }
        @container filter (width < 500px) {
            fieldset > * { display: block; width: 100%; margin: 0.25rem 0; }
        }
    `

    render() {
        return html`
            <form method="get" @submit=${this.onSubmit}>
                <fieldset>
                    <legend>Filter</legend>
                    <input type="search" name="query" @change=${this.onChange} @keyup=${this.onChange}>
                    <select name="leader" @change=${this.onChange}><option selected value="">Leader</option></select>
                    <select name="scenario" @change=${this.onChange}><option selected value="">Scenario</option></select>
                    <select name="map_size" @change=${this.onChange}><option selected value="">Map size</option></select>
                    <select name="difficulty" @change=${this.onChange}><option selected value="">Difficulty</option></select>
                    <label><input type="checkbox" name="locked" @change=${this.onChange}> Not yet unlocked</label>
                </fieldset>
            </form>
            <div class="progress">
                <span data-placeholder="unlocked"></span> of <span data-placeholder="total"></span> (<span data-placeholder="percentage"></span>%) achievements unlocked
            </div>
            <div class="achievements"></div>
        `
    }

    public async connectedCallback(): Promise<void> {
        super.connectedCallback();

        this.updateComplete
            .then(() => this.load());
    }

    private load(): void
    {
        // get data from local storage
        this.unlocked = JSON.parse(localStorage.getItem('unlocked') || '{}');
        this.pinned = JSON.parse(localStorage.getItem('pinned') || '{}');

        const url = new URL(this.src, import.meta.url);
        fetch(url)
            .then(response => response.json())
            .then((json: Achievement[]) => {
                const filtered = json.reduce(
                    (carry: Record<string, string[]>, achievement: Achievement) => {
                        const add = (current: string[]|null, value: string|string[]|null): string[] => {
                            if (Array.isArray(value)) {
                                return value.reduce((carry, v) => add(carry, v), [ ...current || []]);
                            }

                            return value !== null && current.includes(value) === false
                                ? [ ...current || [], value]
                                : current || [];
                        }

                        return {
                            ...carry,
                            leaders: add(carry.leaders, achievement.leaders ?? null),
                            scenarios: add(carry.scenarios, achievement.scenario),
                            map_sizes: add(carry.map_sizes, achievement.map_size),
                            difficulties: add(carry.difficulties, achievement.difficulty),
                        };
                    },
                    {}
                );

                const populate = (select: HTMLElement, values: string[]) => {
                    for (const value of values) {
                        const option = document.createElement('option');
                        option.value = value;
                        option.innerText = value;
                        select.appendChild(option);
                    }
                }

                populate(this.shadowRoot.querySelector('[name="leader"]'), [ ...filtered.leaders ].sort());
                populate(this.shadowRoot.querySelector('[name="scenario"]'), filtered.scenarios);
                populate(this.shadowRoot.querySelector('[name="map_size"]'), filtered.map_sizes);
                populate(this.shadowRoot.querySelector('[name="difficulty"]'), filtered.difficulties);

                // Achievements
                let order = 0;
                render(
                    json.map(({ title, img, leaders, scenario, map_size, difficulty, description }) => html`<civ-achievement data-order="${order++}" @achievement-pinned=${this._handlePinned.bind(this)} @achievement-unpinned=${this._handleUnpinned.bind(this)} title=${title} image=${img} leaders=${JSON.stringify(leaders)} scenario=${scenario} map_size=${map_size} difficulty=${difficulty} description=${description} unlocked=${ifDefined(this.unlocked[title] ? '1' : undefined)} pinned=${ifDefined(this.pinned[title] ? '1' : undefined)} @click=${this._clickAchievement.bind(this)}>`),
                    this.shadowRoot?.querySelector('.achievements') as HTMLDivElement
                );

                this.updateProgress();

                for (const [title, pinned] of Object.entries(this.pinned)) {
                    const achievement = this.shadowRoot.querySelector(`civ-achievement[title="${title}"]`) as CivAchievement;
                    if (achievement && pinned) {
                        achievement.pinned = '1';
                        achievement.style.order = (0 - this.shadowRoot.querySelectorAll('civ-achievement').length + this.shadowRoot.querySelectorAll('civ-achievement[pinned]').length).toString();
                    }
                };
            })
            .catch(console.error);
    }

    private _handlePinned(event: CustomEvent): void
    {
        const achievement = event.target as CivAchievement;
        achievement.style.order = (0 - this.shadowRoot.querySelectorAll('civ-achievement').length + this.shadowRoot.querySelectorAll('civ-achievement[pinned]').length).toString();

        this.pinned[achievement.title] = true;
        localStorage.setItem('pinned', JSON.stringify(this.pinned));
    }

    private _handleUnpinned(event: CustomEvent): void
    {
        const achievement = event.target as CivAchievement;
        achievement.style.order = '';

        // renumber all still pinned elements
        const pinned = Array.from(this.shadowRoot.querySelectorAll('civ-achievement[pinned="1"]'))
            .sort((one: HTMLElement, another: HTMLElement): number => another.style.order.localeCompare(one.style.order, undefined, { numeric: true }));

        delete this.pinned[achievement.title];
        localStorage.setItem('pinned', JSON.stringify(this.pinned));
    }

    private _clickAchievement(event: MouseEvent): void
    {
        const achievement = event.target as CivAchievement;
        if (achievement.unlocked) {
            achievement.removeAttribute('unlocked');
            delete this.unlocked[achievement.title];
        } else {
            achievement.setAttribute('unlocked', '1');
            this.unlocked[achievement.title] = true;
        }

        localStorage.setItem('unlocked', JSON.stringify(this.unlocked));
        this.updateProgress();
    }

    private updateProgress(): void
    {
        const total = this.shadowRoot.querySelectorAll('.achievements civ-achievement').length;
        const unlocked = this.shadowRoot.querySelectorAll('.achievements civ-achievement[unlocked]').length;
        const percentage = Math.round((unlocked/total)*100);

        this.shadowRoot.querySelector('[data-placeholder="unlocked"]').innerHTML = unlocked.toString();
        this.shadowRoot.querySelector('[data-placeholder="total"]').innerHTML = total.toString();
        this.shadowRoot.querySelector('[data-placeholder="percentage"]').innerHTML = percentage.toString();
    }

    // Source: https://medium.com/dev-jam/lit-html-communication-between-components-using-the-mediator-pattern-6d1d3d2efce7
    private onSubmit(event: SubmitEvent): void
    {
        event.preventDefault();
        this.applyFilter();
    }

    private onChange(event: Event): void
    {
        this.applyFilter();
    }

    private applyFilter(): void
    {
        type Filter = {
            query: string;
            leader: string;
            scenario: string;
            map_size: string;
            difficulty: string;
            locked: boolean;
        }

        const filter: Filter = {
            query: (this.shadowRoot.querySelector('[name="query"]') as HTMLInputElement).value,
            leader: (this.shadowRoot.querySelector('[name="leader"]') as HTMLSelectElement).value,
            scenario: (this.shadowRoot.querySelector('[name="scenario"]') as HTMLSelectElement).value,
            map_size: (this.shadowRoot.querySelector('[name="map_size"]') as HTMLSelectElement).value,
            difficulty: (this.shadowRoot.querySelector('[name="difficulty"]') as HTMLSelectElement).value,
            locked: (this.shadowRoot.querySelector('[name="locked"]') as HTMLInputElement).checked,
        };

        this.shadowRoot.querySelectorAll('.achievements > civ-achievement').forEach((achievement: CivAchievement) => {
            const applies = (achievement: CivAchievement, filter: Filter): boolean => {
                if (achievement.pinned === '1') return true;
                if (filter.query && achievement.description.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase()) === false && achievement.title.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase()) === false) return false;
                if (filter.leader && !(achievement.leaders || []).includes(filter.leader)) return false;
                if (filter.scenario && achievement.scenario !== filter.scenario) return false;
                if (filter.map_size && achievement.map_size !== filter.map_size) return false;
                if (filter.difficulty && achievement.difficulty !== filter.difficulty) return false;
                if (filter.locked && achievement.title in this.unlocked && this.unlocked[achievement.title] === true) return false;

                return true;
            };

            if (applies(achievement, filter)) {
                achievement.classList.remove('hide');
            } else {
                achievement.classList.add('hide');
            }
        });
    }
}
