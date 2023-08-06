var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
export let CivAchievement = class CivAchievement extends LitElement {
    image;
    title;
    description;
    leader;
    leaders;
    scenario;
    difficulty;
    map_size;
    unlocked = '';
    pinned = '';
    static styles = css `
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
    `;
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
        // const unlocked = JSON.parse(localStorage.getItem('unlocked') || '{}');
        // this.unlocked = unlocked?.[this.title] === true;
    }
    _clickPin(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.pinned === '1') {
            this.setAttribute('pinned', '');
            this.dispatchEvent(new CustomEvent('achievement-unpinned'));
        }
        else {
            this.setAttribute('pinned', '1');
            this.dispatchEvent(new CustomEvent('achievement-pinned'));
        }
    }
    render() {
        return html `
            <div class="meta">
                <h2>${this.title}</h2>                
                <p>${this.description}</p>
            </div>
            <div class="image">
                <img src=${this.image} alt=${this.title} lazy>
            </div>
            <span class="pin" @click=${this._clickPin.bind(this)}>📌</span>
        `;
    }
};
__decorate([
    property()
], CivAchievement.prototype, "image", void 0);
__decorate([
    property()
], CivAchievement.prototype, "title", void 0);
__decorate([
    property()
], CivAchievement.prototype, "description", void 0);
__decorate([
    property()
], CivAchievement.prototype, "leader", void 0);
__decorate([
    property({ type: Array })
], CivAchievement.prototype, "leaders", void 0);
__decorate([
    property()
], CivAchievement.prototype, "scenario", void 0);
__decorate([
    property()
], CivAchievement.prototype, "difficulty", void 0);
__decorate([
    property()
], CivAchievement.prototype, "map_size", void 0);
__decorate([
    property({ reflect: true, type: String })
], CivAchievement.prototype, "unlocked", void 0);
__decorate([
    property({ reflect: true, type: String })
], CivAchievement.prototype, "pinned", void 0);
CivAchievement = __decorate([
    customElement('civ-achievement')
], CivAchievement);
