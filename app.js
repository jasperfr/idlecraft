GLOBAL_DRAGGED_ITEM = null;

class InventorySlot {
	constructor(inventoryContainer) {
		this.inventoryContainer = inventoryContainer;
		this.item = null;
	}
	render() {
		let $element = $(`<li class="inventory-slot"></li>`);
		if(this.item != null)
			$element.append(this.item.render());
		
		
		// don't ask.
		let otherSlot = this;
		$element.droppable({
			// oh god this is going to be a hell aaaaa
			drop: function(ev, ui) {
				// check self.item first (the other one)
				let otherItem = otherSlot.item;
				let currentSlot = GLOBAL_DRAGGED_ITEM.parentSlot;
				// if the other inventory slot is empty, we can move the item there.
				if(otherItem == null) {
					// Remove the item from the current slot.
					currentSlot.item = null;

					// Add the item to the other slot.
					otherSlot.item = GLOBAL_DRAGGED_ITEM;
					GLOBAL_DRAGGED_ITEM.parentSlot = otherSlot;
				} else {
					currentSlot = GLOBAL_DRAGGED_ITEM.parentSlot;
				}
				currentSlot.inventoryContainer.refresh();
				otherSlot.inventoryContainer.refresh();
			}
		});
		return $element;
	}
}

class Inventory {
	constructor($list, inventorySize = 27) {
		this.$list = $list;
		this.inventory = [];
		do this.inventory.push(new InventorySlot(this));
		while (this.inventory.length < inventorySize);
		this.refresh();
	}

	insert(name, count = 1, maxStack = 64, health = -1) {
		while(count > 0) {
			// item slot of this type exists?
			let itemSlot = this.inventory.filter(slot => slot.item != null
				&& slot.item.name == name
				&& slot.item.count < slot.item.maxStack)[0];
			
			// if the itemslot is not undefined then add one item to it
			if(itemSlot != null) {
				itemSlot.item.count++;
				count--;
			} else {
				// empty slot exists?
				let firstEmptySlot = this.inventory.filter(slot => slot.item == null)[0];
				if(firstEmptySlot != null) {
					firstEmptySlot.item = new Item(name, firstEmptySlot, 1, maxStack, health);
					count--;
				} else {
					// inventory is full, kill function
					return;
				}
			}
		}
	}

	hasTheseItems(list) {
		let nothingMissing = true;
		for(let requiredItem in list) {
			let itemName = requiredItem;
			let itemCount = list[requiredItem];
			if(this.inventory.filter(slot => slot.item != null && slot.item.name == itemName && slot.item.count >= itemCount).length == 0) {
				console.log(`${itemCount}x ${itemName} not found.`);
				nothingMissing = false;
			}
		}
		return nothingMissing;
	}

	removeAll(list) {
		for(let item in list) {
			let itemName = item;
			let itemCount = list[item];
			while(itemCount > 0) {
				let itemSlot = this.inventory.filter(slot => slot.item != null
					&& slot.item.name == itemName
					&& slot.item.count > 0)[0];
				itemSlot.item.count--;
				if(itemSlot.item.count == 0) {
					itemSlot.item = null;
				}
				itemCount--;
			}
		}
	}

	get(name) {
		return this.inventory.filter(item => item.name == name)[0];
	}

	has(name) {
		return this.inventory.filter(item => item.name == name).length > 0;
	}
	refresh() {
		this.$list.empty();
		for(let itemSlot of this.inventory) {
			this.$list.append(itemSlot.render());
		}
	}
}

class Item {
	constructor(name, parentSlot, count = 1, maxStack = 64, toolHealth = -1) {
		this.toolType = 'item';
		this.name = name;
		this.parentSlot = parentSlot
		this.count = count;
		this.maxStack = maxStack;

		this.health = toolHealth;
		// does the item have health? apply it
		if(this.health != -1) {
			this.toolType = 'tool';
			this.maxHealth = toolHealth;
		}
	}

	render() {
		let self = this;
		let $element = $(`<div class="item"><img src="img/${this.name}.png"></div>`);
		if(this.toolType == 'tool') {
			let hpbar = (this.health / this.maxHealth) * 32;
			$element.append($(`<div class="healthbar-wrapper"><div class="healthbar" style="width:${hpbar}px;"></div></div>`));
		} else {
			$element.append($(`<span>${this.count}</span>`));
		}
		$element.draggable({
			revert: "invalid",
			start: function() {
				GLOBAL_DRAGGED_ITEM = self;
			}
		});
		return $element;
	}
}

const Game = (function() {

	// variables
	var inventory;

	// functions
	const start = function($list) {
		inventory = new Inventory($list, 36);
	};

	const refresh = function() {
		inventory.refresh();
	};

	const harvest = function(itemType) {
		inventory.insert(itemType);
		inventory.refresh();
	}

	const craft = function(item, count, required, maxStack = 64, health = -1) {
		if(inventory.hasTheseItems(required)) {
			inventory.insert(item, count, maxStack, health);
			inventory.removeAll(required);
		}
		refresh();
	}

	// module declaration
	return {
		start: start,
		harvest: harvest,
		craft: craft,
		refresh: refresh
	};

})();
