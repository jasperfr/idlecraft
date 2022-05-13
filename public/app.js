// Credits to nblackburn for this function.
// https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().replace(/ /g, '-');
}

function firstLetterUppercase(str) {
    return str.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
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

    for(let [k, v] of Object.entries(player.mining.progress)) {
        if(v < 100) player.mining.progress[k] = Math.min(player.mining.progress[k] + player.mining.speed, 100);
        $(`.harvest-${k}-progress`).attr('value', player.mining.progress[k]);
    }

    for(let [k, v] of Object.entries(player.inventory.items)) {
        const $grid = $('.inventory-grid');
        let className = camelToKebab(k);
        let $gridItem = $grid.find(`.inventory-grid-${className}`);
        if($gridItem.length) {
            $gridItem.find('span').text(`${firstLetterUppercase(k)} (${v})`);
        } else {
            $grid.append($(`<griditem class="inventory-grid-${className}">
                <img src="icons/items/${className}.png" alt="" onerror=this.src="icons/program.png">
                <span>${firstLetterUppercase(k)} (${v})</span>
            </griditem>`));
        }
    }
    /*
    for(let [k, v] of Object.entries(player.inventory.items)) {
        const $table = $('.inventory-table');
        let className = camelToKebab(k);
        let $tr = $table.find(`tr.inventory-table-${className}`);
        if($tr.length) {
            $tr.find('td.inventory-table-amount').text(v);
        } else {
            $table.append($(`<tr class="inventory-table-${className}">
                <th>${$table.find('tr').length}</th>
                <td class="inventory-table-name">${firstLetterUppercase(k)} (${v})</td>
                <td class="inventory-table-amount">${v}</td>
                <td class="inventory-table-production">0 / sec</td>
            </tr>`))           
        }
    }
    */

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

    mining: {
        speed: 1,
        progress: {
            stone: 100,
            coal: 100,
            iron: 100,
            copper: 100
        },
        harvest: function(itemType) {
            if(player.mining.progress[itemType] === 100) {
                player.inventory.add(itemType, 1);
                player.mining.progress[itemType] = 0;
            }
        }
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

const Game =  {

    save() {
        const inventoryData = { ...player.inventory.items };
        const formattedData = btoa(JSON.stringify(inventoryData));
        localStorage.factorySaveGame = formattedData;
    },
    
    load() {
        if(!localStorage.factorySaveGame) return;
        const parsedData = JSON.parse(atob(localStorage.factorySaveGame));
        player.inventory.items = { ...parsedData };        
    },

	start() {
        // Try to load the data
        Game.load();

        // Component registration
        $('window').draggable({ 'handle': 'titlebar', 'stack': 'window' }).hide();
        $('.taskbar-button').hide();
        $('window').mousedown(function() {
            WindowManager.setLastOpenWindow(this.id);
        })
        for(let recipe of Object.keys(recipes)) {
            $('#manual-crafting-list').append(
                $(`<button onclick="player.crafting.craft('${recipe}');">Craft ${recipe}</button>`)
            );
        }

        setInterval(Game.save, 10000);
	}
}

const WindowManager = {
    lastOpenWindow: null,

    setLastOpenWindow(window) {
        this.lastOpenWindow = window;
        $('window').removeClass('focus');
        $('window#' + this.lastOpenWindow).addClass('focus');        
    },

    open(window) {
        $('window#' + window).show();
        $('window#' + window).css('top', '20px').css('left', '20px');
        $('taskbar button.' + window).show();
        this.setLastOpenWindow(window);
    },

    minimize(window) {
        $('window#' + window).hide();
    },

    toggle(window) {
        $('window#' + window).toggle();        
    },

    close(window) {
        $('window#' + window).hide();
        $('taskbar button.' + window).hide();
    }
};
