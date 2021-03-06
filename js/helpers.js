/*global NodeList */
(function (window) {
	'use strict';

	/**
	 * Get element(s) by CSS selector: qs = querySelector
	 * use in {@link View}
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * Get element(s) by CSS selector: qsa = querySelectorAll
	 * use in {@link View}
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * addEventListener wrapper:
	 * @param {object} (target)  	Target
	 * @param {bolean} (type) 		Focus or Blur
	 * @param {function} (callback) Callback
	 * @param {object} (useCapture) Use Capture
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * Attach a handler to event for all elements that match the selector,now or in the future, based on a root element
	 * @param {object} (target)   	 Target
	 * @param  {function} (selector) Check that there is a match between childrens	 and parents
	 * @param {bolean} (type) 		 Type of event
	 * @param  {function} (handler)  Callback under condition
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target; // target element
			var potentialElements = window.qsa(selector, target); // qsa of element
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0; // in potentialElements there is targetElement, if> = o there is an index and it matches

			if (hasMatch) {
				/**
				 * call the manager on the target element
				 */
				handler.call(targetElement, event);
			}
		}

		var useCapture = type === 'blur' || type === 'focus';// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		/**
		 * $on : add eventListener
		 */
		window.$on(target, type, dispatchEvent, useCapture);
	};

	/**
	 *  Find the element's parent with the given tag name: $parent(qs('a'), 'div');
	 * @param {object} (element) Element 
	 * @param {string} (tagName) Tag name 
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) { // if  not parent element 
			return; //nothing
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {//if the tagName of the parent element in lowercase is strictly equal to our tagName
			return element.parentNode; //return parent element
		}
		return window.$parent(element.parentNode, tagName);
	};

	 /**
	  * Allow for looping on nodes by chaining: qsa('.foo').forEach(function () {})
	  */
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
