const Grid = {
    create(className) {
        const $element = $(`<grid class=${className}>`);
        $element.add = function(item) {
            let $container = $('<griditem>');
            $container.append(item);
            $element.append($container);
            return this;
        }
        return $element;
    },
}

const Icon = function(text, icon, fn, shortcut = false) {
    const $el = $(`<icon ${shortcut ? 'class="shortcut"' : ''}>
        <img src="${icon}.png" alt=""/>
        ${text.startsWith('=') ? `<span class="${text.slice(1)}"></span>` : `<span>${text}</span>`}
    </icon>`);
    $el.dblclick(() => fn());
    return $el;
}
