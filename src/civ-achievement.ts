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

    @property()
    public leader: string;

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

    static styles = css`
        :host([unlocked]) {
            background: yellow !important;
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

    render() {
        return html`
            <div>
                <h2>${this.title}</h2>
                <img src=${this.image} alt=${this.title} lazy>
                <p>${this.description}</p>
            </div>
        `
    }
}
