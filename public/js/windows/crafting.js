$(() => {
    WindowManager.create({
        id: 'wnd-manual-crafting',
        title: 'Crafting',
        titleIcon: 'icons/gears',

        content: $(`<content style="display: flex; flex-direction: row;">
            <table class="crafting-queue-table">
                <tr class="crafting-queue-table-header">
                    <th></th>
                    <th>A</th>
                    <th>B</th>
                </tr>
                <tr class="crafting-queue-table-header">
                    <th>1</th>
                    <td>Item</td>
                    <td>Status</td>
                </tr>
            </table>
            <div id="manual-crafting-list" class="inventory-box tool-box"></div>
        </content>`),

        desktopIcon: true,
        desktopShortcut: true
    });
})