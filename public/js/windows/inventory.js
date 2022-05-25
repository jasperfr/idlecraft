$(() => {
    WindowManager.create({
        id: 'explorer-inventory',
        title: 'Inventory',
        titleIcon: 'icons/folder',

        content: $(`<content>
            <grid class="inventory-grid"></grid>
        </content>`),

        desktopIcon: true,
        desktopShortcut: false

    });
});
