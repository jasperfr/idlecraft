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
        $('window').draggable({ 'handle': 'titlebar', 'stack': 'window' });
        $('.taskbar-button').hide();
        $('window').mousedown(function() {
            WindowManager.setLastOpenWindow(this.id);
        })
        for(let recipe of Object.keys(recipes)) {
            let $button = $(`<button style="display:flex;" onclick="player.crafting.craft('${recipe}');"></button>`);
            let requires = recipes[recipe].requires;
            let produces = recipes[recipe].produces;
            for(let production of produces) {
                $button.append($(`<div>
                    <img src="icons/items/${camelToKebab(production.type)}.png"/>
                    <span>${production.amount}</span>
                </div>`));
            }

            $button.append($('<div class="spacer"></div>'));

            for(let requirement of requires) {
                $button.append($(`<div>
                    <img src="icons/items/${camelToKebab(requirement.type)}.png"/>
                    <span>${requirement.amount}</span>
                </div>`));
            }

            $('#manual-crafting-list').append($button);
        }

        function setDate() {
            let d = new Date();
            let h = (1000 + d.getHours()).toString().slice(2);
            let m = (1000 + d.getMinutes()).toString().slice(2);
            $('taskbar .taskbar-clock').text(`${h}:${m}`);
        }
        setInterval(setDate, 10000);
        setDate();

        $('body').click(() => {
            $('#contextmenu').hide();
        })

        setInterval(Game.save, 10000);
	}

}
