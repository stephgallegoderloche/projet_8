/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	 * View that abstracts away the browser's DOM completely.
	 * It has two simple entry points:
	 *
	 *   - bind(eventName, handler)
	 *     Takes a todo application event and registers the handler
	 *   - command, parameterObject)
	 *     Renders the given command with the options
	 * @constructor 
	 */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Delet the Todo according to the ID
	 * @param {number} (id) ID for delet
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * Hide the completed items
	 * @param  {number} (completedCount) Completed Count
	 * @param  {bolean} (visible) 		 True if visible, else false 
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	/**
	 * Is the current page
	 * @param {string} (currentPage) The current page can have the values :
	 *                               '' || active || completed.
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Test : if element Complete 
	 * @param  {number} (id)   		Test element ID
	 * @param  {bolean} (completed) Element status
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};

	/**
	 * Edit item
	 * @param  {number} (id) 	Element ID
	 * @param  {string} (title) Element modify
	 */
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * Replace old todo for new todo
	 * @param  {number} (id)    Element ID
	 * @param  {string} (title) Element modify
	 */
	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	/**
	 * Render methods
	 * @memberof View
	 * @param  {string} (viewCmd)   Function active
	 * @param  {object} (parameter) Parameters active
	 */
	View.prototype.render = function (viewCmd, parameter) {
		
		var self = this;
		var viewCommands = {
			/**
			 * Displays elements
			 */
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},

			/**
			 * Delet element
			 */
			removeItem: function () {
				self._removeItem(parameter);
			},

			/**
			 * Update Count
			 */
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},

			/**
			 * Display button 'clearCompleted'
			 */
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},

			/**
			 * visible element
			 */
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},

			/**
			 * Display all elements
			 */
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},

			/**
			 * Filter elements
			 */
			setFilter: function () {
				self._setFilter(parameter);
			},

			/**
			 * Clear new todo in input
			 */
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},

			/**
			 * Display completed elements
			 */
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},

			/**
			 * Edit item
			 */
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},

			/**
			 * Save edit item
			 */
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	/**
	 * Add element ID 
	 * @param  {object} (element) Element active.
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * EventListener valid edit item
	 * @param  {function} (handler) Callback under condition.
 	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				/**
				 * Remove the cursor from the input when you hit enter just like if it were a real form
				 */
				this.blur();
			}
		});
	};

	/**
	 * EventListener delet edit item
	 * @param  {function} (handler) Callback under condition
   	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};

	/**
	 * Make the link between the methods of {@link Controller} and the elements of {@link View}.
	 * @param  {function} (event)   Active element
	 * @param  {function} (handler) Callback under condition
	 */
	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === 'newTodo') {

			/**
			 * $on : add eventListener.
			 * Past self.$newTodo.value at handler 
			 */
				$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
