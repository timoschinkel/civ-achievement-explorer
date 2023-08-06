var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, LitElement, html, render } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
let CivAchievementsFilter = class CivAchievementsFilter extends LitElement {
    // Source: https://rodydavis.com/posts/lit-html-table/
    data;
    src;
    unlocked = {};
    static styles = css `
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
    `;
    render() {
        return html `
            <form method="get" @submit=${this.onSubmit}>
                <fieldset>
                    <legend>Filter</legend>
                    <input type="search" name="query" @change=${this.onChange} @keyup=${this.onChange}>
                    <select name="leader" @change=${this.onChange}><option selected value="">Leader</option></select>
                    <select name="scenario" @change=${this.onChange}><option selected value="">Scenario</option></select>
                    <select name="map_size" @change=${this.onChange}><option selected value="">Map size</option></select>
                    <select name="difficulty" @change=${this.onChange}><option selected value="">Difficulty</option></select>
                    <label><input type="checkbox" name="unlocked" @change=${this.onChange}> Unlocked</label>
                </fieldset>
            </form>
            <div class="progress">
                <span data-placeholder="unlocked"></span> of <span data-placeholder="total"></span> (<span data-placeholder="percentage"></span>%) achievements unlocked
            </div>
            <div class="achievements"></div>
        `;
    }
    async connectedCallback() {
        super.connectedCallback();
        this.updateComplete
            .then(() => this.load());
    }
    load() {
        // get data from local storage
        this.unlocked = JSON.parse(localStorage.getItem('unlocked') || '{}');
        const url = new URL(this.src, import.meta.url);
        fetch(url)
            .then(response => response.json())
            .then((json) => {
            const unlocked = Object.entries(this.unlocked).length;
            const total = json.length;
            const percentage = Math.round((unlocked / total) * 100);
            this.shadowRoot.querySelector('[data-placeholder="unlocked"]').innerHTML = unlocked.toString();
            this.shadowRoot.querySelector('[data-placeholder="total"]').innerHTML = total.toString();
            this.shadowRoot.querySelector('[data-placeholder="percentage"]').innerHTML = percentage.toString();
            const filtered = json.reduce((carry, achievement) => {
                const add = (current, value) => {
                    if (Array.isArray(value)) {
                        return value.reduce((carry, v) => add(carry, v), [...current || []]);
                    }
                    return value !== null && current.includes(value) === false
                        ? [...current || [], value]
                        : current || [];
                };
                return {
                    ...carry,
                    leaders: add(carry.leaders, achievement.leader ?? achievement.leaders ?? null),
                    scenarios: add(carry.scenarios, achievement.scenario),
                    map_sizes: add(carry.map_sizes, achievement.map_size),
                    difficulties: add(carry.difficulties, achievement.difficulty),
                };
            }, {});
            const populate = (select, values) => {
                for (const value of values) {
                    const option = document.createElement('option');
                    option.value = value;
                    option.innerText = value;
                    select.appendChild(option);
                }
            };
            populate(this.shadowRoot.querySelector('[name="leader"]'), [...filtered.leaders].sort());
            populate(this.shadowRoot.querySelector('[name="scenario"]'), filtered.scenarios);
            populate(this.shadowRoot.querySelector('[name="map_size"]'), filtered.map_sizes);
            populate(this.shadowRoot.querySelector('[name="difficulty"]'), filtered.difficulties);
            // Achievements
            let order = 0;
            render(json.map(({ title, img, leader, leaders, scenario, map_size, difficulty, description }) => html `<civ-achievement data-order="${order++}" @achievement-pinned=${this._handlePinned.bind(this)} @achievement-unpinned=${this._handleUnpinned.bind(this)} title=${title} image=${img} leader=${leader} leaders=${JSON.stringify(leaders)} scenario=${scenario} map_size=${map_size} difficulty=${difficulty} description=${description} unlocked=${ifDefined(this.unlocked[title] ? '1' : undefined)} @click=${this._clickAchievement.bind(this)}>`), this.shadowRoot?.querySelector('.achievements'));
        })
            .catch(console.error);
    }
    _handlePinned(event) {
        // const achievement = event.target as HTMLElement;
        // achievement.style.order = (0 - this.shadowRoot.querySelectorAll('civ-achievement').length + this.shadowRoot.querySelectorAll('civ-achievement[pinned]').length).toString();
    }
    _handleUnpinned(event) {
        // const achievement = event.target as HTMLElement;
        // achievement.style.order = '';
        // // renumber all still pinned elements
        // const pinned = Array.from(this.shadowRoot.querySelectorAll('civ-achievement[pinned="1"]'))
        //     .sort((one: HTMLElement, another: HTMLElement): number => another.style.order.localeCompare(one.style.order, undefined, { numeric: true }));
        // console.log(pinned);
    }
    _clickAchievement(event) {
        const achievement = event.target;
        if (achievement.unlocked) {
            achievement.removeAttribute('unlocked');
            delete this.unlocked[achievement.title];
        }
        else {
            achievement.setAttribute('unlocked', '1');
            this.unlocked[achievement.title] = true;
        }
        localStorage.setItem('unlocked', JSON.stringify(this.unlocked));
    }
    // Source: https://medium.com/dev-jam/lit-html-communication-between-components-using-the-mediator-pattern-6d1d3d2efce7
    onSubmit(event) {
        event.preventDefault();
        this.applyFilter();
    }
    onChange(event) {
        this.applyFilter();
    }
    applyFilter() {
        const filter = {
            query: this.shadowRoot.querySelector('[name="query"]').value,
            leader: this.shadowRoot.querySelector('[name="leader"]').value,
            scenario: this.shadowRoot.querySelector('[name="scenario"]').value,
            map_size: this.shadowRoot.querySelector('[name="map_size"]').value,
            difficulty: this.shadowRoot.querySelector('[name="difficulty"]').value,
            unlocked: this.shadowRoot.querySelector('[name="unlocked"]').checked,
        };
        this.shadowRoot.querySelectorAll('.achievements > civ-achievement').forEach((achievement) => {
            const applies = (achievement, filter) => {
                if (achievement.pinned === '1')
                    return true;
                if (filter.query && achievement.description.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase()) === false && achievement.title.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase()) === false)
                    return false;
                if (filter.leader && achievement.leader !== filter.leader && !(achievement.leaders || []).includes(filter.leader))
                    return false;
                if (filter.scenario && achievement.scenario !== filter.scenario)
                    return false;
                if (filter.unlocked && achievement.title in this.unlocked && this.unlocked[achievement.title] === true)
                    return false;
                return true;
            };
            if (applies(achievement, filter)) {
                achievement.classList.remove('hide');
            }
            else {
                achievement.classList.add('hide');
            }
        });
    }
};
__decorate([
    property()
], CivAchievementsFilter.prototype, "src", void 0);
CivAchievementsFilter = __decorate([
    customElement('civ-achievements-filter')
], CivAchievementsFilter);
