$(() => {
    WindowManager.create({
        id: 'wnd-manual-gathering',
        title: 'Gathering',
        titleIcon: 'icons/pickaxe',

        content: $(`<content>
            <div id="harvest-stone" class="inventory-box tool-box">
                <button onclick="player.mining.harvest('stone');">Mine stone</button>
                <progress max="100" value="0" class="harvest-stone-progress choppy">70%</progress>
            </div>
            <br/>
            <div id="harvest-coal" class="inventory-box tool-box">
                <button onclick="player.mining.harvest('coal');">Mine coal</button>
                <progress max="100" value="0" class="harvest-coal-progress choppy"></progress>
            </div>
            <br/>
            <div id="harvest-copper" class="inventory-box tool-box">
                <button onclick="player.mining.harvest('copper ore');">Mine copper</button>
                <progress max="100" value="0" class="harvest-copper-ore-progress choppy"></progress>
            </div>
            <br/>
            <div id="harvest-iron" class="inventory-box tool-box">
                <button onclick="player.mining.harvest('iron ore');">Mine iron</button>
                <progress max="100" value="0" class="harvest-iron-ore-progress choppy"></progress>
            </div>
        </content>`),

        desktopIcon: true,
        desktopShortcut: true
    });
})