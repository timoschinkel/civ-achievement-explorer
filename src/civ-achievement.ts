import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('civ-achievement')
export class CivAchievement extends LitElement {
    @property()
    public image: string;

    @property()
    public title: string;

    @property()
    public description: string;

    @property({ type: Array })
    public leaders: string[];

    @property()
    public scenario: string;

    @property()
    public difficulty: string;

    @property()
    public map_size: string;

    @property({ reflect: true, type: String })
    public unlocked: string = '';

    @property({ reflect: true, type: String })
    public pinned: string = '';

    static styles = css`
        :host {
            background: #293c51;
            display: grid;
            grid-template-columns: 64px auto;
            padding: .5rem;
            grid-gap: .5rem;
            font-size: 12px;
            cursor: pointer;
            position: relative;
        }

        :host > *:not(.pin) {
            filter: grayscale();
        }

        :host(:hover) {
            filter: none;
            box-shadow: inset 0px 0px 0px 1px #f0f0f0;
        }
        :host([unlocked]) > *:not(.pin) {
            filter: none;
        }

        :host .image {
            order: 0;
        }
        :host .meta {
            order: 1;
        }

        :host img {
            width: 100%;
        }

        :host h2 {
            margin-top: 0;
            font-size: 17px;
        }

        :host .pin {
            position: absolute;
            left: .5rem;
            bottom: .5rem;
            cursor: pointer;

            filter: grayscale() !important;
        }

        :host .pin:hover,
        :host([pinned="1"]) .pin {
            filter: none !important;
        }
    `

    constructor() {
        super();
    }

    public connectedCallback(): void {
        super.connectedCallback()

        // const unlocked = JSON.parse(localStorage.getItem('unlocked') || '{}');
        // this.unlocked = unlocked?.[this.title] === true;
    }

    private _clickPin(event: MouseEvent): void
    {
        event.preventDefault();
        event.stopPropagation();

        if (this.pinned === '1') {
            this.setAttribute('pinned', '');
            this.dispatchEvent(new CustomEvent('achievement-unpinned'));
        } else {
            this.setAttribute('pinned', '1');
            this.dispatchEvent(new CustomEvent('achievement-pinned'));
        }
    }

    render() {
        return html`
            <div class="meta">
                <h2>${this.title}</h2>
                <p>${this.description}</p>
            </div>
            <div class="image">
                <img src=${this.image} alt=${this.title} lazy>
            </div>
            <span class="pin" @click=${this._clickPin.bind(this)}>📌</span>
        `
    }
}
