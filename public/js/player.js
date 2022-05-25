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
        },

        tick() {

        },

        render() {
            for(let [k, v] of Object.entries(this.items)) {

                if(['windmill', 'miner', 'smelter'].includes(k)) {
                    continue;
                };
        
                const $grid = $('.inventory-grid');
                let className = camelToKebab(k);
                let $gridItem = $grid.find(`.inventory-grid-${className}`);
                if($gridItem.length) {
                    $gridItem.find('span').text(`${firstLetterUppercase(k)} (${v})`);
                } else {
                    const $element = $(`<griditem class="inventory-grid-${className}">
                        <img src="icons/items/${className}.png" alt="" onerror=this.src="icons/program.png">
                        <span>${firstLetterUppercase(k)} (${v})</span>
                    </griditem>`);
                    $element.contextmenu((e) => {
                        e.preventDefault();
                        $('#contextmenu').empty();
                        $('#contextmenu').append($(`
                            <li>
                                <img src="icons/items/${className}.png" alt="" onerror=this.src="icons/program.png">
                                <span>${firstLetterUppercase(k)} (${v})</span>
                            </li>
                            ${k in player.smelting.dictionary ? '<hr/><li onclick="player.smelting.smelt(\'' + k + '\')">Smelt</li>' : ''}
                            <hr/>
                            <li>
                                <img src="icons/ico/ico-info.png" alt="">
                                <span>Info</span>
                            </li>
                            <li>
                                <img src="icons/ico/ico-hide.png" alt="">
                                <span>Hide</span>
                            </li>
                            <li>
                                <img src="icons/ico/ico-delete.png" alt="">
                                <span>Delete</span>
                            </li>
                        `))
                        $('#contextmenu').css({ left: e.clientX, top: e.clientY }).hide().show('fast');
                    })
                    $grid.append($element);
                }
            }
        }
    },

    /* Manual */
    mining: {
        speed: 1,
        progress: {
            stone: 100,
            coal: 100,
            'iron ore': 100,
            'copper ore': 100
        },
        harvest: function(itemType) {
            if(player.mining.progress[itemType] === 100) {
                player.inventory.add(itemType, 1);
                player.mining.progress[itemType] = 0;
            }
        },

        tick() {
            for(let [k, v] of Object.entries(this.progress)) {
                if(v < 100) this.progress[k] = Math.min(this.progress[k] + this.speed, 100);
            }
        },

        render() {
            for(let k of Object.keys(this.progress)) {
                $(`.harvest-${k.replace(' ', '-')}-progress`)
                    .attr('value', Math.round(this.progress[k] / 10) * 10);
            }
        }
    },

    smelting: {
        speed: 0.45,
        progress: 0,
        smelting: null,

        dictionary: {
            'iron ore': 'iron',
            'copper ore': 'copper',
            'stone': 'stone plate',
            'coal': 'graphite'
        },

        smelt(itemName) {
            if(!(itemName in player.smelting.dictionary)) return;
            if(player.inventory.get(itemName) <= 0) return;
            if(player.inventory.get('coal') < (itemName === 'coal' ? 2 : 1)) return;

            player.inventory.add(itemName, -1);
            player.inventory.add('coal', -1);

            this.smelting = itemName;

            const $window = $('#wnd-manual-smelting-progress');
            $window.find('img.input').attr('src', `icons/items/${camelToKebab(itemName)}.png`);
            $window.find('img.output').attr('src', `icons/items/${camelToKebab(player.smelting.dictionary[itemName])}.png`);
            $window.css({ left: '50%', top: '50%', 'z-index': 100 })
            $window.show();
            WindowManager.setLastOpenWindow('wnd-manual-smelting-progress');
        },

        tick() {
            if(!this.smelting) return;

            const $window = $('#wnd-manual-smelting-progress');

            this.progress += this.speed;
            if(this.progress >= 100) {
                this.progress = 0;
                player.inventory.add(this.dictionary[this.smelting], 1);
                if(player.inventory.get(this.smelting) <= 0 || player.inventory.get('coal') < (this.smelting === 'coal' ? 2 : 1)) {
                    this.stop();
                    return;
                }
                player.inventory.add(this.smelting, -1);
                player.inventory.add('coal', -1);
            }

            $window.find('progress').val(Math.round(this.progress / 10) * 10);
            $window.find('titlebar span').text('Smelting (' + this.progress.toFixed(0) + '%)');
        },

        stop() {
            const $window = $('#wnd-manual-smelting-progress');
            this.smelting = null;
            this.progress = 0;
            $window.hide();
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
            this.queue.push({time: recipe.time, produces: recipe.produces });
        },

        tick() {
            if(this.queue.length > 0) {
                this.craftingProgress++;
                if(this.craftingProgress > this.queue[0].time) {
                    const creation = this.queue.shift().produces[0];
                    player.inventory.add(creation.type, creation.amount);
                    this.craftingProgress = 0;
                }
            }
        },

        render() {
            $('.crafting-queue-table').find('tr').not('tr.crafting-queue-table-header').remove();
            for(let i = 0; i < this.queue.length; i++) {
                const queueItem = this.queue[i].produces[0];
                $('.crafting-queue-table').append($(`<tr>
                    <th>${i + 2}</th>
                    <td>${queueItem.type} x${queueItem.amount}</td>
                    <td>${i == 0 ? (this.craftingProgress / this.queue[i].time * 100).toFixed(2) + '%' : ''}</td>
                </tr>`))
            }
        }
    },

    /* Automatic */
    power: {
        _i: 0,

        powerData: {
            production: [],
            consumption: [],
            gain: [],
        },

        production() {
            return (
                (player.inventory.items.windmill ? player.inventory.items.windmill * 100 + ~~(Math.random() * 50) : 0) +
                (player.inventory.items.coalGenerator ? player.inventory.items.coalGenerator * 120 : 0) +
                (player.inventory.items.solarPanel ? player.inventory.items.solarPanel * 60 : 0)
            );
        },
        consumption() {
            return player.miners.getPowerConsumption();
        },
        tick() {            
            const canvas = document.querySelector('#power-graph');
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            this._i--;
            if(this._i < -(width / 10)) {
                if(this.powerData.production.length > 11) {
                    this.powerData.production = this.powerData.production.slice(1);
                }
                this.powerData.production.push(this.production());
                
                if(this.powerData.consumption.length > 11) {
                    this.powerData.consumption = this.powerData.consumption.slice(1);
                }
                this.powerData.consumption.push(this.consumption());


                this._i += width / 10;
            }            

            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = '#0f0';
            for(let i = 0; i < width + (width / 10); i += (width / 10)) {
                ctx.beginPath();
                ctx.moveTo(this._i + i, 0);
                ctx.lineTo(this._i + i, height);
                ctx.stroke();
            }

            ctx.strokeStyle = '#f00';
            let min = Math.min(...this.powerData.consumption, ...this.powerData.production);
            let max = Math.max(...this.powerData.consumption, ...this.powerData.production);
            for(let i = 0; i < this.powerData.consumption.length - 1; i++) {
                let amount = this.powerData.consumption[i];
                let amount2 = this.powerData.consumption[i + 1];
                ctx.beginPath();
                ctx.moveTo(this._i + i * (width / 10), height - (amount / max) * height);
                ctx.lineTo(this._i + (i + 1) * (width / 10), height - (amount2 / max) * height);
                ctx.stroke();                
            }

            ctx.strokeStyle = '#ff0';
            for(let i = 0; i < this.powerData.production.length - 1; i++) {
                let amount = this.powerData.production[i];
                let amount2 = this.powerData.production[i + 1];
                ctx.beginPath();
                ctx.moveTo(this._i + i * (width / 10), height - (amount / max) * height);
                ctx.lineTo(this._i + (i + 1) * (width / 10), height - (amount2 / max) * height);
                ctx.stroke();                
            }

        },
        render() {
            $('#power-production').text(player.power.production().toFixed(2) + ' kW');
            $('#power-consumption').text(player.power.consumption().toFixed(2) + ' kW');
            $('#power-gain').text((player.power.production() - player.power.consumption()).toFixed(2) + ' kW');
            
            // Update text for power sources
            $('.windmill-count').text(`Windmill (${player.inventory.get('windmill')})`);
            $('.coal-plant-count').text(`Coal Plant (${player.inventory.get('coal plant')})`);
            $('.solar-panel-count').text(`Solar Panel (${player.inventory.get('solar panel')})`);
            $('.nuclear-reactor-count').text(`Nuclear Reactor (${player.inventory.get('nuclear reactor')})`);
            $('.fusion-reactor-count').text(`Fusion Reactor (${player.inventory.get('fusion reactor')})`);
        }
    },

    miners:  {
        miners: [],

        getPowerConsumption() {
            return 100 * (this.miners.filter(m => m.type !== 'none').length ** 1.25);
        },

        addNew() {
            this.miners.push({
                id: this.miners.length,
                $element: null,
                $dialog: null,
                type: 'none',
                progress: 0
            });
        },

        assign(id, type) {
            console.log(id, type);
            const miner = this.miners.filter(m => m.id === id)[0];
            if(!miner) return;
            miner.type = type;
            miner.progress = 0;
            miner.$element.find('icon > img').attr('src', `icons/32/miners/miner-${camelToKebab(miner.type)}.png`);
        },

        tick() {
            while(this.miners.length < player.inventory.get('miner')) {
                this.addNew();
            }

            let enoughPower = this.getPowerConsumption() <= player.power.production();
            for(let miner of this.miners) {
                if(miner.type === 'none' || !enoughPower) {
                    miner.progress = 0;
                    continue;
                }
                miner.progress += 0.125;
                if(miner.progress > 100) {
                    miner.progress = 0;
                    player.inventory.add(miner.type, 1);
                }
            }
        },
        
        render() {
            const $grid = $('.miners-grid');

            for(let miner of this.miners) {
                if(!miner.$element) {
                    miner.$element = $(`
                    <griditem>
                        <icon>
                            <img src="icons/32/miners/miner-${camelToKebab(miner.type)}.png" alt=""/>
                            <span></span>
                        </icon>
                    </griditem>`);

                    miner.$element.contextmenu(e => {
                        e.preventDefault();
                        Contextmenu.empty();
                        Contextmenu.add('Change to Iron', () => this.assign(miner.id, 'iron ore'), 'iron-ore');
                        Contextmenu.add('Change to Copper', () => this.assign(miner.id, 'copper ore'), 'copper-ore');
                        Contextmenu.add('Change to Stone', () => this.assign(miner.id, 'stone'), 'stone');
                        Contextmenu.add('Change to Coal', () => this.assign(miner.id, 'coal'), 'coal');
                        Contextmenu.add('Change to Uranium', () => this.assign(miner.id, 'uranium'), 'uranium');
                        Contextmenu.div();
                        Contextmenu.add('Disable', () => this.assign(miner.id, 'none'), 'none');
                        Contextmenu.show(e);
                    });

                    miner.$element.on('dblclick', () => {
                        if(miner.$dialog) {
                            miner.$dialog.show();
                            return;
                        };
                        
                        miner.$dialog = WindowManager.create({
                            title: 'Mining information',
                            width: 'auto',
                            height: 'auto',
                            margin: '8px',

                            content: $(`
                                <content>                            
                                    <h6>Currently mining: ${firstLetterUppercase(miner.type)}</h6>
                                    <br/>                       
                                    <progress max="100"></progress>
                                </content>
                            `),

                            contentCSS: ``,

                            onClose: function() {
                                miner.$dialog = null;
                            }
                        });
                    })

                    $grid.append(miner.$element);
                }

                if(miner.$dialog) {
                    miner.$dialog.$content.find('progress').val(miner.progress);
                }

                miner.$element.find('span').html(`${firstLetterUppercase(miner.type)}<br/>(${miner.progress.toFixed(1)}%)`);
            }
        }
    },

    smelters: {
        smelters: [],

        dictionary: {
            'iron ore': 'iron',
            'copper ore': 'copper',
            'stone': 'stone plate',
            'coal': 'graphite'
        },

        addNew() {
            this.smelters.push({
                id: this.smelters.length,
                $element: null,
                $dialog: null,
                type: 'none',
                progress: 0
            });
        },

        assign(id, type) {
            const smelter = this.smelters.filter(m => m.id === id)[0];
            if(!smelter) return;
            smelter.type = type;
            smelter.progress = 0;
        },

        tick() {
            while(this.smelters.length < player.inventory.get('smelter')) {
                this.addNew();
            }

            for(let smelter of this.smelters) {
                if(smelter.type === 'none') continue;

                if(smelter.progress === 0) {
                    if(player.inventory.get(smelter.type) > 0 && player.inventory.get('coal') > 0) {
                        player.inventory.add(smelter.type, -1);
                        player.inventory.add('coal', -1);
                        smelter.progress += 0.3;
                    }
                }

                else {
                    smelter.progress += 0.3;
                    if(smelter.progress > 100) {
                        smelter.progress = 0;
                        player.inventory.add(this.dictionary[smelter.type], 1);                        
                    }
                }
            }
        },

        render() {
            const $grid = $('.smelters-grid');

            for(let smelter of this.smelters) {
                if(!smelter.$element) {
                    smelter.$element = $(`
                    <griditem>
                        <icon>
                            <img src="icons/32/furnace.png" alt=""/>
                            <span></span>
                        </icon>
                    </griditem>`);


                    smelter.$element.contextmenu(e => {
                        e.preventDefault();
                        Contextmenu.empty();
                        Contextmenu.add('Change to Iron', () => this.assign(smelter.id, 'iron ore'), 'iron-ore');
                        Contextmenu.add('Change to Copper', () => this.assign(smelter.id, 'copper ore'), 'copper-ore');
                        Contextmenu.add('Change to Stone', () => this.assign(smelter.id, 'stone'), 'stone');
                        Contextmenu.add('Change to Coal', () => this.assign(smelter.id, 'coal'), 'coal');
                        Contextmenu.div();
                        Contextmenu.add('Disable', () => this.assign(smelter.id, 'none'), 'none');
                        Contextmenu.show(e);
                    });
                    
                    $grid.append(smelter.$element);
                }

                smelter.$element
                    .find('span')
                    .html(`${firstLetterUppercase(smelter.type)}<br/>(${smelter.progress.toFixed(1)}%)`);
            }
        }
    }
}

function update() {
    player.mining.tick();
    player.crafting.tick();
    player.smelting.tick();
    player.power.tick();
    player.miners.tick();
    player.smelters.tick();

    player.inventory.render();
    player.mining.render();
    player.crafting.render();
    player.miners.render();
    player.power.render();
    player.smelters.render();

    requestAnimationFrame(update);
}

$(() => {
    requestAnimationFrame(update);
});
