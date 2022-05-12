// Credits to nblackburn for this function.
// https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().replace(/ /g, '-');
}

function update() {
    if(player.crafting.queue.length > 0) {
        player.crafting.craftingProgress++;
        if(player.crafting.craftingProgress > player.crafting.queue[0].time) {
            const creation = player.crafting.queue.shift();
            player.inventory.add(creation.type, creation.amount);
            player.crafting.craftingProgress = 0;
        }
    }

    for(let [k, v] of Object.entries(player.progress)) {
        if(v < 100) player.progress[k] = Math.min(player.progress[k] + player.mineSpeed, 100);
        $(`.harvest-${k}-progress`).attr('value', player.progress[k]);
    }

    for(let [k, v] of Object.entries(player.inventory.items)) {
        const $table = $('.inventory-table');
        let className = camelToKebab(k);
        let $tr = $table.find(`tr.inventory-table-${className}`);
        if($tr.length) {
            $tr.find('td.inventory-table-amount').text(v);
        } else {
            $table.append($(`<tr class="inventory-table-${className}">
                <th>${$table.find('tr').length}</th>
                <td class="inventory-table-name">${k}</td>
                <td class="inventory-table-amount">${v}</td>
                <td class="inventory-table-production">0 / sec</td>
            </tr>`))           
        }
    }

    $('.crafting-queue-table').find('tr').not('tr.crafting-queue-table-header').remove();
    for(let i = 0; i < player.crafting.queue.length; i++) {
        const queueItem = player.crafting.queue[i];
        $('.crafting-queue-table').append($(`<tr>
            <th>${i + 2}</th>
            <td>${queueItem.type} x${queueItem.amount}</td>
            <td>${i == 0 ? (player.crafting.craftingProgress / queueItem.time * 100).toFixed(2) + '%' : ''}</td>
        </tr>`))
    }

    $('#power-production').text(player.power.production() + ' kW');
    $('#power-consumption').text(player.power.consumption() + ' kW');
    $('#power-gain').text(player.power.production() - player.power.consumption() + ' kW');

    requestAnimationFrame(update);
}
requestAnimationFrame(update);

const recipes = {
    'iron gear': {
        requires: [{ type: 'iron', amount: 1 }],
        produces: { type: 'iron gear', amount: 1, time: 150 }
    },
    'iron beam': {
        requires: [{ type: 'iron', amount: 1 }],
        produces: { type: 'iron beam', amount: 1, time: 150 }
    },
    'copper wire': {
        requires: [{ type: 'copper', amount: 2 }],
        produces: { type: 'copper wire', amount: 3, time: 150 }
    },
    'stone plate': {
        requires: [{ type: 'stone', amount: 2 }],
        produces: { type: 'stone plate', amount: 1, time: 150 }
    },
    'basic circuit board': {
        requires: [{ type: 'stone plate', amount: 1 }, { type: 'copper wire', amount: 3 }],
        produces: { type: 'basic circuit board', amount: 1, time: 200 }
    },
    'windmill': {
        requires: [{ type: 'iron beam', amount: 3 }, { type: 'iron gear', amount: 2 }, { type: 'stone plate', amount: 2 }],
        produces: { type: 'windmill', amount: 1, time: 240 }
    }
}

const player = {
    inventory: {
        items: {},
        add: function(item, amount = 1) {
            if(!this.items[item]) {
                this.items[item] = amount;
            } else {
                this.items[item] += amount;
            }
        },
        get: function(item) {
            if(!this.items[item]) return 0;
            else return this.items[item];            
        },
        set: function(item, amount = 0) {
            console.log(this);
            this.items[item] = amount;
        }
    },
    mineSpeed: 1,
    progress: {
        stone: 100,
        coal: 100,
        iron: 100,
        copper: 100
    },
    crafting: {
        craftingProgress: 0,
        queue: [],
        craft: function(key) {
            const recipe = recipes[key];
            for(let requirement of recipe.requires) {
                if(player.inventory.get(requirement.type) < requirement.amount) return;
            }
            for(let requirement of recipe.requires) {
                player.inventory.add(requirement.type, -requirement.amount);
            }
            this.queue.push({...recipe.produces});
        }
    },
    power: {
        production() {
            return (
                (player.inventory.items.windmill ? player.inventory.items.windmill * 30 : 0) +
                (player.inventory.items.coalGenerator ? player.inventory.items.coalGenerator * 120 : 0) +
                (player.inventory.items.solarPanel ? player.inventory.items.solarPanel * 60 : 0)
            );
        },
        consumption() {
            return 0;
        }
    }
}

const Game = (function() {

	// variables
	var inventory;

	// functions
	const start = function($list) {
        $('window').draggable({ 'handle': 'titlebar' });

        for(let recipe of Object.keys(recipes)) {
            $('#manual-crafting-list').append(
                $(`<button onclick="player.crafting.craft('${recipe}');">Craft ${recipe}</button>`)
            );
        }
	};

	const refresh = function() {
		inventory.refresh();
	};

	const harvest = function(itemType) {
        if(player.progress[itemType] === 100) {
            player.inventory.add(itemType, 1);
            player.progress[itemType] = 0;
        }
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

function minimize(hwnd) {
    $('#' + hwnd).hide();
}

function toggle(hwnd) {
    $('#' + hwnd).toggle();
}

function close(hwnd) {

}