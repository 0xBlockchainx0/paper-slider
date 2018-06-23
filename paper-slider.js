/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/**
Material design: [Sliders](https://www.google.com/design/spec/components/sliders.html)

`paper-slider` allows user to select a value from a range of values by
moving the slider thumb.  The interactive nature of the slider makes it a
great choice for settings that reflect intensity levels, such as volume,
brightness, or color saturation.

Example:

    <paper-slider></paper-slider>

Use `min` and `max` to specify the slider range.  Default is 0 to 100.

Example:

    <paper-slider min="10" max="200" value="110"></paper-slider>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|----------
`--paper-slider-container-color` | The background color of the bar | `--paper-grey-400`
`--paper-slider-bar-color` | The background color of the slider | `transparent`
`--paper-slider-active-color` | The progress bar color | `--google-blue-700`
`--paper-slider-secondary-color` | The secondary progress bar color | `--google-blue-300`
`--paper-slider-knob-color` | The knob color | `--google-blue-700`
`--paper-slider-disabled-knob-color` | The disabled knob color | `--paper-grey-400`
`--paper-slider-pin-color` | The pin color | `--google-blue-700`
`--paper-slider-font-color` | The pin's text color | `#fff`
`--paper-slider-markers-color` | The snaps markers color | `#000`
`--paper-slider-disabled-active-color` | The disabled progress bar color | `--paper-grey-400`
`--paper-slider-disabled-secondary-color` | The disabled secondary progress bar color | `--paper-grey-400`
`--paper-slider-knob-start-color` | The fill color of the knob at the far left | `transparent`
`--paper-slider-knob-start-border-color` | The border color of the knob at the far left | `--paper-grey-400`
`--paper-slider-pin-start-color` | The color of the pin at the far left | `--paper-grey-400`
`--paper-slider-height` | Height of the progress bar | `2px`
`--paper-slider-input` | Mixin applied to the input in editable mode | `{}`
`--paper-slider-input-container-input` | Mixin applied to the paper-input-container-input in editable mode | `{}`

@group Paper Elements
@element paper-slider
@demo demo/index.html
@hero hero.svg
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import { IronRangeBehavior } from '@polymer/iron-range-behavior/iron-range-behavior.js';
import { PaperInkyFocusBehavior, PaperInkyFocusBehaviorImpl } from '@polymer/paper-behaviors/paper-inky-focus-behavior.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-styles/color.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { setTouchAction } from '@polymer/polymer/lib/utils/gestures.js';
const $_documentContainer = document.createElement('template');
$_documentContainer.setAttribute('style', 'display: none;');

$_documentContainer.innerHTML = `<dom-module id="paper-slider">
  <template strip-whitespace="">
    <style>
      :host {
        @apply --layout;
        @apply --layout-justified;
        @apply --layout-center;
        width: 200px;
        cursor: default;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        --paper-progress-active-color: var(--paper-slider-active-color, var(--google-blue-700));
        --paper-progress-secondary-color: var(--paper-slider-secondary-color, var(--google-blue-300));
        --paper-progress-disabled-active-color: var(--paper-slider-disabled-active-color, var(--paper-grey-400));
        --paper-progress-disabled-secondary-color: var(--paper-slider-disabled-secondary-color, var(--paper-grey-400));
        --calculated-paper-slider-height: var(--paper-slider-height, 2px);
      }

      /* focus shows the ripple */
      :host(:focus) {
        outline: none;
      }

      /**
       * NOTE(keanulee): Though :host-context is not universally supported, some pages
       * still rely on paper-slider being flipped when dir="rtl" is set on body. For full
       * compatability, dir="rtl" must be explicitly set on paper-slider.
       */
      :dir(rtl) #sliderContainer {
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
      }

      /**
       * NOTE(keanulee): This is separate from the rule above because :host-context may
       * not be recognized.
       */
      :host([dir="rtl"]) #sliderContainer {
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
      }

      /**
       * NOTE(keanulee): Needed to override the :host-context rule (where supported)
       * to support LTR sliders in RTL pages.
       */
      :host([dir="ltr"]) #sliderContainer {
        -webkit-transform: scaleX(1);
        transform: scaleX(1);
      }

      #sliderContainer {
        position: relative;
        width: 100%;
        height: calc(30px + var(--calculated-paper-slider-height));
        margin-left: calc(15px + var(--calculated-paper-slider-height)/2);
        margin-right: calc(15px + var(--calculated-paper-slider-height)/2);
      }

      #sliderContainer:focus {
        outline: 0;
      }

      #sliderContainer.editable {
        margin-top: 12px;
        margin-bottom: 12px;
      }

      .bar-container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: hidden;
      }

      .ring > .bar-container {
        left: calc(5px + var(--calculated-paper-slider-height)/2);
        transition: left 0.18s ease;
      }

      .ring.expand.dragging > .bar-container {
        transition: none;
      }

      .ring.expand:not(.pin) > .bar-container {
        left: calc(8px + var(--calculated-paper-slider-height)/2);
      }

      #sliderBar {
        padding: 15px 0;
        width: 100%;
        background-color: var(--paper-slider-bar-color, transparent);
        --paper-progress-container-color: var(--paper-slider-container-color, var(--paper-grey-400));
        --paper-progress-height: var(--calculated-paper-slider-height);
      }

      .slider-markers {
        position: absolute;
        /* slider-knob is 30px + the slider-height so that the markers should start at a offset of 15px*/
        top: 15px;
        height: var(--calculated-paper-slider-height);
        left: 0;
        right: -1px;
        box-sizing: border-box;
        pointer-events: none;
        @apply --layout-horizontal;
      }

      .slider-marker {
        @apply --layout-flex;
      }
      .slider-markers::after,
      .slider-marker::after {
        content: "";
        display: block;
        margin-left: -1px;
        width: 2px;
        height: var(--calculated-paper-slider-height);
        border-radius: 50%;
        background-color: var(--paper-slider-markers-color, #000);
      }

      .slider-knob {
        position: absolute;
        left: 0;
        top: 0;
        margin-left: calc(-15px - var(--calculated-paper-slider-height)/2);
        width: calc(30px + var(--calculated-paper-slider-height));
        height: calc(30px + var(--calculated-paper-slider-height));
      }

      .transiting > .slider-knob {
        transition: left 0.08s ease;
      }

      .slider-knob:focus {
        outline: none;
      }

      .slider-knob.dragging {
        transition: none;
      }

      .snaps > .slider-knob.dragging {
        transition: -webkit-transform 0.08s ease;
        transition: transform 0.08s ease;
      }

      .slider-knob-inner {
        margin: 10px;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        background-color: var(--paper-slider-knob-color, var(--google-blue-700));
        border: 2px solid var(--paper-slider-knob-color, var(--google-blue-700));
        border-radius: 50%;

        -moz-box-sizing: border-box;
        box-sizing: border-box;

        transition-property: -webkit-transform, background-color, border;
        transition-property: transform, background-color, border;
        transition-duration: 0.18s;
        transition-timing-function: ease;
      }

      .expand:not(.pin) > .slider-knob > .slider-knob-inner {
        -webkit-transform: scale(1.5);
        transform: scale(1.5);
      }

      .ring > .slider-knob > .slider-knob-inner {
        background-color: var(--paper-slider-knob-start-color, transparent);
        border: 2px solid var(--paper-slider-knob-start-border-color, var(--paper-grey-400));
      }

      .slider-knob-inner::before {
        background-color: var(--paper-slider-pin-color, var(--google-blue-700));
      }

      .pin > .slider-knob > .slider-knob-inner::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        margin-left: -13px;
        width: 26px;
        height: 26px;
        border-radius: 50% 50% 50% 0;

        -webkit-transform: rotate(-45deg) scale(0) translate(0);
        transform: rotate(-45deg) scale(0) translate(0);
      }

      .slider-knob-inner::before,
      .slider-knob-inner::after {
        transition: -webkit-transform .18s ease, background-color .18s ease;
        transition: transform .18s ease, background-color .18s ease;
      }

      .pin.ring > .slider-knob > .slider-knob-inner::before {
        background-color: var(--paper-slider-pin-start-color, var(--paper-grey-400));
      }

      .pin.expand > .slider-knob > .slider-knob-inner::before {
        -webkit-transform: rotate(-45deg) scale(1) translate(17px, -17px);
        transform: rotate(-45deg) scale(1) translate(17px, -17px);
      }

      .pin > .slider-knob > .slider-knob-inner::after {
        content: attr(value);
        position: absolute;
        top: 0;
        left: 50%;
        margin-left: -16px;
        width: 32px;
        height: 26px;
        text-align: center;
        color: var(--paper-slider-font-color, #fff);
        font-size: 10px;

        -webkit-transform: scale(0) translate(0);
        transform: scale(0) translate(0);
      }

      .pin.expand > .slider-knob > .slider-knob-inner::after {
        -webkit-transform: scale(1) translate(0, -17px);
        transform: scale(1) translate(0, -17px);
      }

      /* paper-input */
      .slider-input {
        width: 50px;
        overflow: hidden;
        --paper-input-container-input: {
          text-align: center;
          @apply --paper-slider-input-container-input;
        };
        @apply --paper-slider-input;
      }

      /* disabled state */
      #sliderContainer.disabled {
        pointer-events: none;
      }

      .disabled > .slider-knob > .slider-knob-inner {
        background-color: var(--paper-slider-disabled-knob-color, var(--paper-grey-400));
        border: 2px solid var(--paper-slider-disabled-knob-color, var(--paper-grey-400));
        -webkit-transform: scale3d(0.75, 0.75, 1);
        transform: scale3d(0.75, 0.75, 1);
      }

      .disabled.ring > .slider-knob > .slider-knob-inner {
        background-color: var(--paper-slider-knob-start-color, transparent);
        border: 2px solid var(--paper-slider-knob-start-border-color, var(--paper-grey-400));
      }

      paper-ripple {
        color: var(--paper-slider-knob-color, var(--google-blue-700));
      }
    </style>

    <div id="sliderContainer" class\$="[[_getClassNames(disabled, pin, snaps, immediateValue, min, expand, dragging, transiting, editable)]]">
      <div class="bar-container">
        <paper-progress disabled\$="[[disabled]]" id="sliderBar" aria-hidden="true" min="[[min]]" max="[[max]]" step="[[step]]" value="[[immediateValue]]" secondary-progress="[[secondaryProgress]]" on-down="_bardown" on-up="_resetKnob" on-track="_bartrack" on-tap="_barclick">
        </paper-progress>
      </div>

      <template is="dom-if" if="[[snaps]]">
        <div class="slider-markers">
          <template is="dom-repeat" items="[[markers]]">
            <div class="slider-marker"></div>
          </template>
        </div>
      </template>

      <div id="sliderKnob" class="slider-knob" on-down="_knobdown" on-up="_resetKnob" on-track="_onTrack" on-transitionend="_knobTransitionEnd">
          <div class="slider-knob-inner" value\$="[[immediateValue]]"></div>
      </div>
    </div>

    <template is="dom-if" if="[[editable]]">
      <paper-input id="input" type="number" step="[[step]]" min="[[min]]" max="[[max]]" class="slider-input" disabled\$="[[disabled]]" value="[[immediateValue]]" on-change="_changeValue" on-keydown="_inputKeyDown" no-label-float="">
      </paper-input>
    </template>
  </template>

  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
  is: 'paper-slider',

  behaviors: [
    IronA11yKeysBehavior,
    IronFormElementBehavior,
    PaperInkyFocusBehavior,
    IronRangeBehavior
  ],

  properties: {

    value: {type: Number, value: 0},

    /**
     * If true, the slider thumb snaps to tick marks evenly spaced based
     * on the `step` property value.
     */
    snaps: {type: Boolean, value: false, notify: true},

    /**
     * If true, a pin with numeric value label is shown when the slider thumb
     * is pressed. Use for settings for which users need to know the exact
     * value of the setting.
     */
    pin: {type: Boolean, value: false, notify: true},

    /**
     * The number that represents the current secondary progress.
     */
    secondaryProgress: {
      type: Number,
      value: 0,
      notify: true,
      observer: '_secondaryProgressChanged'
    },

    /**
     * If true, an input is shown and user can use it to set the slider value.
     */
    editable: {type: Boolean, value: false},

    /**
     * The immediate value of the slider.  This value is updated while the user
     * is dragging the slider.
     */
    immediateValue: {type: Number, value: 0, readOnly: true, notify: true},

    /**
     * The maximum number of markers
     */
    maxMarkers: {type: Number, value: 0, notify: true},

    /**
     * If true, the knob is expanded
     */
    expand: {type: Boolean, value: false, readOnly: true},

    /**
     * If true, a touchmove on the slider bar doesn't drag the slider thunb.
     * Tapping on the slider bar still updates the slider's position
     */
    ignoreBarTouch: {type: Boolean, value: false},

    /**
     * True when the user is dragging the slider.
     */
    dragging: {type: Boolean, value: false, readOnly: true, notify: true},

    transiting: {type: Boolean, value: false, readOnly: true},

    markers: {
      type: Array,
      readOnly: true,
      value: function() {
        return [];
      }
    },
  },

  observers: [
    '_updateKnob(value, min, max, snaps, step)',
    '_valueChanged(value)',
    '_immediateValueChanged(immediateValue)',
    '_updateMarkers(maxMarkers, min, max, snaps)'
  ],

  hostAttributes: {role: 'slider', tabindex: 0},

  keyBindings: {
    'left': '_leftKey',
    'right': '_rightKey',
    'down pagedown home': '_decrementKey',
    'up pageup end': '_incrementKey'
  },

  ready: function() {
    if (this.ignoreBarTouch) {
      setTouchAction(this.$.sliderBar, 'auto');
    }
  },

  /**
   * Increases value by `step` but not above `max`.
   * @method increment
   */
  increment: function() {
    this.value = this._clampValue(this.value + this.step);
  },

  /**
   * Decreases value by `step` but not below `min`.
   * @method decrement
   */
  decrement: function() {
    this.value = this._clampValue(this.value - this.step);
  },

  _updateKnob: function(value, min, max, snaps, step) {
    this.setAttribute('aria-valuemin', min);
    this.setAttribute('aria-valuemax', max);
    this.setAttribute('aria-valuenow', value);

    this._positionKnob(this._calcRatio(value) * 100);
  },

  _valueChanged: function() {
    this.fire('value-change', {composed: true});
  },

  _immediateValueChanged: function() {
    if (this.dragging) {
      this.fire('immediate-value-change', {composed: true});
    } else {
      this.value = this.immediateValue;
    }
  },

  _secondaryProgressChanged: function() {
    this.secondaryProgress = this._clampValue(this.secondaryProgress);
  },

  _expandKnob: function() {
    this._setExpand(true);
  },

  _resetKnob: function() {
    this.cancelDebouncer('expandKnob');
    this._setExpand(false);
  },

  _positionKnob: function(ratio) {
    this._setImmediateValue(this._calcStep(this._calcKnobPosition(ratio)));
    this._setRatio(this._calcRatio(this.immediateValue) * 100);

    this.$.sliderKnob.style.left = this.ratio + '%';
    if (this.dragging) {
      this._knobstartx = (this.ratio * this._w) / 100;
      this.translate3d(0, 0, 0, this.$.sliderKnob);
    }
  },

  _calcKnobPosition: function(ratio) {
    return (this.max - this.min) * ratio / 100 + this.min;
  },

  _onTrack: function(event) {
    event.stopPropagation();
    switch (event.detail.state) {
      case 'start':
        this._trackStart(event);
        break;
      case 'track':
        this._trackX(event);
        break;
      case 'end':
        this._trackEnd();
        break;
    }
  },

  _trackStart: function(event) {
    this._setTransiting(false);
    this._w = this.$.sliderBar.offsetWidth;
    this._x = this.ratio * this._w / 100;
    this._startx = this._x;
    this._knobstartx = this._startx;
    this._minx = -this._startx;
    this._maxx = this._w - this._startx;
    this.$.sliderKnob.classList.add('dragging');
    this._setDragging(true);
  },

  _trackX: function(event) {
    if (!this.dragging) {
      this._trackStart(event);
    }

    var direction = this._isRTL ? -1 : 1;
    var dx =
        Math.min(this._maxx, Math.max(this._minx, event.detail.dx * direction));
    this._x = this._startx + dx;

    var immediateValue =
        this._calcStep(this._calcKnobPosition(this._x / this._w * 100));
    this._setImmediateValue(immediateValue);

    // update knob's position
    var translateX =
        ((this._calcRatio(this.immediateValue) * this._w) - this._knobstartx);
    this.translate3d(translateX + 'px', 0, 0, this.$.sliderKnob);
  },

  _trackEnd: function() {
    var s = this.$.sliderKnob.style;

    this.$.sliderKnob.classList.remove('dragging');
    this._setDragging(false);
    this._resetKnob();
    this.value = this.immediateValue;

    s.transform = s.webkitTransform = '';

    this.fire('change', {composed: true});
  },

  _knobdown: function(event) {
    this._expandKnob();

    // cancel selection
    event.preventDefault();

    // set the focus manually because we will called prevent default
    this.focus();
  },

  _bartrack: function(event) {
    if (this._allowBarEvent(event)) {
      this._onTrack(event);
    }
  },

  _barclick: function(event) {
    this._w = this.$.sliderBar.offsetWidth;
    var rect = this.$.sliderBar.getBoundingClientRect();
    var ratio = (event.detail.x - rect.left) / this._w * 100;
    if (this._isRTL) {
      ratio = 100 - ratio;
    }
    var prevRatio = this.ratio;

    this._setTransiting(true);
    this._positionKnob(ratio);

    // if the ratio doesn't change, sliderKnob's animation won't start
    // and `_knobTransitionEnd` won't be called
    // Therefore, we need to manually update the `transiting` state
    if (prevRatio === this.ratio) {
      this._setTransiting(false);
    }

    this.async(function() {
      this.fire('change', {composed: true});
    });

    // cancel selection
    event.preventDefault();

    // set the focus manually because we will called prevent default
    this.focus();
  },

  _bardown: function(event) {
    if (this._allowBarEvent(event)) {
      this.debounce('expandKnob', this._expandKnob, 60);
      this._barclick(event);
    }
  },

  _knobTransitionEnd: function(event) {
    if (event.target === this.$.sliderKnob) {
      this._setTransiting(false);
    }
  },

  _updateMarkers: function(maxMarkers, min, max, snaps) {
    if (!snaps) {
      this._setMarkers([]);
    }
    var steps = Math.round((max - min) / this.step);
    if (steps > maxMarkers) {
      steps = maxMarkers;
    }
    if (steps < 0 || !isFinite(steps)) {
      steps = 0;
    }
    this._setMarkers(new Array(steps));
  },

  _mergeClasses: function(classes) {
    return Object.keys(classes)
        .filter(function(className) {
          return classes[className];
        })
        .join(' ');
  },

  _getClassNames: function() {
    return this._mergeClasses({
      disabled: this.disabled,
      pin: this.pin,
      snaps: this.snaps,
      ring: this.immediateValue <= this.min,
      expand: this.expand,
      dragging: this.dragging,
      transiting: this.transiting,
      editable: this.editable
    });
  },

  _allowBarEvent: function(event) {
    return (
        !this.ignoreBarTouch ||
        (event.detail.sourceEvent instanceof MouseEvent))
  },

  get _isRTL() {
    if (this.__isRTL === undefined) {
      this.__isRTL = window.getComputedStyle(this)['direction'] === 'rtl';
    }
    return this.__isRTL;
  },

  _leftKey: function(event) {
    if (this._isRTL)
      this._incrementKey(event);
    else
      this._decrementKey(event);
  },

  _rightKey: function(event) {
    if (this._isRTL)
      this._decrementKey(event);
    else
      this._incrementKey(event);
  },

  _incrementKey: function(event) {
    if (!this.disabled) {
      if (event.detail.key === 'end') {
        this.value = this.max;
      } else {
        this.increment();
      }
      this.fire('change');
      event.preventDefault();
    }
  },

  _decrementKey: function(event) {
    if (!this.disabled) {
      if (event.detail.key === 'home') {
        this.value = this.min;
      } else {
        this.decrement();
      }
      this.fire('change');
      event.preventDefault();
    }
  },

  _changeValue: function(event) {
    this.value = event.target.value;
    this.fire('change', {composed: true});
  },

  _inputKeyDown: function(event) {
    event.stopPropagation();
  },

  // create the element ripple inside the `sliderKnob`
  _createRipple: function() {
    this._rippleContainer = this.$.sliderKnob;
    return PaperInkyFocusBehaviorImpl._createRipple.call(this);
  },

  // Hide the ripple when user is not interacting with keyboard.
  // This behavior is different from other ripple-y controls, but is
  // according to spec:
  // https://www.google.com/design/spec/components/sliders.html
  _focusedChanged: function(receivedFocusFromKeyboard) {
    if (receivedFocusFromKeyboard) {
      this.ensureRipple();
    }
    if (this.hasRipple()) {
      // note, ripple must be un-hidden prior to setting `holdDown`
      if (receivedFocusFromKeyboard) {
        this._ripple.style.display = '';
      } else {
        this._ripple.style.display = 'none';
      }
      this._ripple.holdDown = receivedFocusFromKeyboard;
    }
  }
});

/**
 * Fired when the slider's value changes.
 *
 * @event value-change
 */

/**
 * Fired when the slider's immediateValue changes. Only occurs while the
 * user is dragging.
 *
 * To detect changes to immediateValue that happen for any input (i.e.
 * dragging, tapping, clicking, etc.) listen for immediate-value-changed
 * instead.
 *
 * @event immediate-value-change
 */

/**
 * Fired when the slider's value changes due to user interaction.
 *
 * Changes to the slider's value due to changes in an underlying
 * bound variable will not trigger this event.
 *
 * @event change
 */
