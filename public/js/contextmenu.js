const Contextmenu = {
    $element: null,

    init() {
        this.$element = $('#contextmenu');
    },

    empty() {
        this.$element.empty();
    },

    add(text, fn, icon) {
        const $el = $(`<li>
            <img src="icons/ico/ico-${icon}.png" alt="">
            <span>${text}</span>
        </li>`);
        $el.click(() => fn());
        this.$element.append($el);
        return this;
    },

    div() {
        this.$element.append($('<hr/>'))
        return this;
    },

    show(e) {
        this.$element.css({ left: e.clientX, top: e.clientY }).hide().show();
    }
}

$(() => {
    Contextmenu.init();
});
