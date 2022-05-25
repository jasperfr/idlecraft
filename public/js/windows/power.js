$(() => {
    WindowManager.create({
        id: 'wnd-power',
        title: 'Power',
        titleIcon: 'icons/power',

        content: $(`<content>
            <table>
                <tr><th>Production</th><td id="power-production"></td></tr>
                <tr><th>Consumption</th><td id="power-consumption"></td></tr>
                <tr><th>Gain</th><td id="power-gain"></td></tr>
            </table>
            <canvas id="power-graph"></canvas>
        </content>`),

        desktopIcon: true,
        desktopShortcut: true
    });
});
