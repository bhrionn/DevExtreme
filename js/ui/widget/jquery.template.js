var $ = require("../../core/renderer"),
    errors = require("../../core/errors"),
    typeUtils = require("../../core/utils/type"),
    TemplateBase = require("./ui.template_base"),
    domUtils = require("../../core/utils/dom");

var templateEngines = {};
var registerTemplateEngine = function(name, templateEngine) {
    templateEngines[name] = templateEngine;
};

registerTemplateEngine("default", {
    compile: (element) => domUtils.normalizeTemplateElement(element),
    render: (template, model, index, transclude) => transclude ? template : template.clone()
});

registerTemplateEngine("jquery-tmpl", {
    compile: function(element) {
        return domUtils.extractTemplateMarkup(element);
    },
    render: function(template, data) {
        /* global jQuery */
        return jQuery.tmpl(template, data);
    }
});

registerTemplateEngine("jsrender", {
    compile: function(element) {
        /* global jQuery */
        /* global jsrender */
        return (jQuery ? jQuery : jsrender).templates(domUtils.extractTemplateMarkup(element));
    },
    render: function(template, data) {
        return template.render(data);
    }
});

registerTemplateEngine("mustache", {
    compile: function(element) {
        /* global Mustache */
        return domUtils.extractTemplateMarkup(element);
    },
    render: function(template, data) {
        return Mustache.render(template, data);
    }
});

registerTemplateEngine("hogan", {
    compile: function(element) {
        /* global Hogan */
        return Hogan.compile(domUtils.extractTemplateMarkup(element));
    },
    render: function(template, data) {
        return template.render(data);
    }
});

registerTemplateEngine("underscore", {
    compile: function(element) {
        /* global _ */
        return _.template(domUtils.extractTemplateMarkup(element));
    },
    render: function(template, data) {
        return template(data);
    }
});

registerTemplateEngine("handlebars", {
    compile: function(element) {
        /* global Handlebars */
        return Handlebars.compile(domUtils.extractTemplateMarkup(element));
    },
    render: function(template, data) {
        return template(data);
    }
});

registerTemplateEngine("doT", {
    compile: function(element) {
        /* global doT */
        return doT.template(domUtils.extractTemplateMarkup(element));
    },
    render: function(template, data) {
        return template(data);
    }
});


var currentTemplateEngine;
var setTemplateEngine = function(templateEngine) {
    if(typeUtils.isString(templateEngine)) {
        currentTemplateEngine = templateEngines[templateEngine];
        if(!currentTemplateEngine) {
            throw errors.Error("E0020", templateEngine);
        }
    } else {
        currentTemplateEngine = templateEngine;
    }
};

setTemplateEngine("default");


var Template = TemplateBase.inherit({

    ctor: function(element) {
        this._element = element;

        this._compiledTemplate = currentTemplateEngine.compile(element);
    },

    _renderCore: function(options) {
        return $("<div>").append(
            currentTemplateEngine.render(this._compiledTemplate, options.model, options.index, options.transclude)
        ).contents();
    },

    source: function() {
        return $(this._element).clone();
    }

});

module.exports = Template;
module.exports.setTemplateEngine = setTemplateEngine;
