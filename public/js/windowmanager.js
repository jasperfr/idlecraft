class Mindow {
    constructor(options = {}) {
        // Element data
        this.$window = null;
        this.$taskbar = null;
        this.$content = options.content || $('<content>');
        this.$desktopIcon = null;

        // Titlebar data
        this.id = options.id || 'wnd-' + (Date.now()).toString();
        this.titleIcon = options.titleIcon || null;
        this.title = options.title || 'New Window';
        this.showDesktopIcon = options.desktopIcon;
        this.desktopShortcut = options.desktopShortcut;

        // Styling data
        this.width = options.width || 'auto';
        this.height = options.height || 'auto';
        this.margin = options.margin || 0;

        // Event listener data
        this.onClose = options.onClose || null;
        this.onMinimize = options.onMinimize || null;

        // Initialize window
        this.initialize();
    }

    initialize() {
        // Create elements
        this.$window = $(`<window id="${this.id}">
            <titlebar>
                ${this.titleIcon ? `<img src="${this.titleIcon}.png" class="icon">` : ''}
                <span>${this.title}</span>
                <button onclick="WindowManager.minimize('${this.id}')">__</button>
                <button class="btn-close">╳</button>
            </titlebar>
        </window>`);
        this.$window.append(this.$content);
        this.$taskbar = $(`<button class="taskbar-button ${this.id}" onclick="WindowManager.toggle('${this.id}')">
            ${this.title}
        </button>`);
        if(this.showDesktopIcon) {
            this.$desktopIcon = $(`<icon ${this.desktopShortcut ? 'class="shortcut"' : ''} ondblclick="WindowManager.open('${this.id}')">
                <img src="${this.titleIcon}.png" alt=""/>
                <span>${this.title}</span>
            </icon>`);
        }

        // Set window styling
        this.$window.css({
            width: this.width,
            height: this.height
        });
        this.$content.css({
            margin: this.margin
        });

        // Attach event listeners
        this.$window.find('.btn-minimize').click(() => this._onMinimize());
        this.$window.find('.btn-close').click(() => this._onClose());

        // Attach UI handles
        this.$window.draggable().draggable({ 'handle': 'titlebar', 'stack': 'window' });
        this.$window.mousedown(() => { WindowManager.setLastOpenWindow(this.id) });

        // Append to body
        if(this.$desktopIcon) $('#desktop-icons').append(this.$desktopIcon);
        $(document.body).append(this.$window);
        $('.taskbar-buttons').append(this.$taskbar);

        this.$window.hide();
    }

    find(query) {
        return this.$content.find(query);
    }

    show() {
        WindowManager.show(this.id);        
    }

    _onClose() {
        this.onClose?.();
        WindowManager.close(this.id);
    }

    _onMinimize() {
        this.onMinimize?.();
        WindowManager.minimize(this.id);
    }
}


const WindowManager = {
    lastOpenWindow: null,

    setLastOpenWindow(window) {
        this.lastOpenWindow = window;
        $('window').css('z-index', '0');
        $('window').removeClass('focus');
        $('window#' + this.lastOpenWindow).addClass('focus');  
        $('window#' + this.lastOpenWindow).css('z-index', '100');      
    },

    create(options = {}) {
        return new Mindow(options);
    },

    show(window) {
        $('window#' + window).show();
        $('taskbar button.' + window).show();
        this.setLastOpenWindow(window);
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
        this.setLastOpenWindow(window);
    },

    close(window) {
        $('window#' + window).hide();
        $('taskbar button.' + window).hide();
    }
};
