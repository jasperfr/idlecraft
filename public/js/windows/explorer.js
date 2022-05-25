$(() => {
    WindowManager.create({
        id: 'explorer-factory',
        title: 'My Factory',
        titleIcon: 'icons/computer',

        content: Grid.create('computer-grid')
            .add(Icon('Save/Load', 'icons/32/floppy', () => {}))
            .add(Icon('C:/', 'icons/32/drive', () => { WindowManager.open('explorer-c') }))
            .add(Icon('Settings', 'icons/32/controlpanel', () => {})),

        desktopIcon: true,
        desktopShortcut: false
    });

    WindowManager.create({
        id: 'explorer-c',
        title: 'C:/',
        titleIcon: 'icons/32/drive',

        content: Grid.create('computer-grid')
            .add(Icon('Inventory', 'icons/32/folder', () => WindowManager.open('explorer-inventory')))
            .add(Icon('Miners', 'icons/32/folder', () => WindowManager.open('explorer-miners')))
            .add(Icon('Smelters', 'icons/32/folder', () => WindowManager.open('explorer-smelters')))
            .add(Icon('Assemblers', 'icons/32/folder', () => WindowManager.open('explorer-assemblers')))
            .add(Icon('Power', 'icons/32/folder-power', () => WindowManager.open('explorer-power')))
            .add(Icon('mine.exe', 'icons/pickaxe', () => WindowManager.open('wnd-manual-gathering')))
            .add(Icon('craft.exe', 'icons/gears', () => WindowManager.open('wnd-manual-crafting')))
    });

    WindowManager.create({
        id: 'explorer-miners',
        title: 'C:/Miners/',
        titleIcon: 'icons/32/folder',

        content: $(`<grid class="miners-grid"></grid>`)
    });

    WindowManager.create({
        id: 'explorer-smelters',
        title: 'C:/Smelters/',
        titleIcon: 'icons/32/folder',

        content: $(`<grid class="smelters-grid"></grid>`)
    });

    WindowManager.create({
        id: 'explorer-assemblers',
        title: 'C:/Asemblers/',
        titleIcon: 'icons/32/folder',

        content: $(`<grid class="assemblers-grid"></grid>`)
    });

    WindowManager.create({
        id: 'explorer-power',
        title: 'C:/Power/',
        titleIcon: 'icons/32/folder-power',

        content: Grid.create('computer-grid')
            .add(Icon('pmgr.exe', 'icons/power', () => { WindowManager.open('wnd-power') } ))
            .add(Icon('=windmill-count', 'icons/items/windmill', () => {} ))
            .add(Icon('=coal-plant-count', 'icons/items/undefined', () => {} ))
            .add(Icon('=solar-panel-count', 'icons/items/undefined', () => {} ))
            .add(Icon('=nuclear-reactor-count', 'icons/items/undefined', () => {} ))
            .add(Icon('=fusion-reactor-count', 'icons/items/undefined', () => {} ))
    })
});
