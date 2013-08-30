/**
 * stacktable.js
 * Author & copyright (c) 2012: John Polacek
 * Dual MIT & GPL license
 *
 * Page: http://johnpolacek.github.com/stacktable.js
 * Repo: https://github.com/johnpolacek/stacktable.js/
 *
 * jQuery plugin for stacking tables on small screens
 *
 * This version has been modified for a custom layout
 * (one table per row of original table), and to clone
 * the original cells in order to retain functionality.
 *
 */

(function($) {
    $.fn.stacktable = function(options) {
        var $tables = this;
        var defaults = {
            id: "stacktable",
            hideOriginal: false
        };
        var settings = $.extend({}, defaults, options);
        var stacktable;
        return $tables.each(function() {
            $table = $(this);
            $topRow = $table.find("tr").eq(0);
            $table.find("tr").each(function(index, value) {
                if (index > 0) {
                    var $stacktable = $("<table class='" + settings.id + "'><tbody></tbody></table>");
                    if (typeof settings.myClass !== undefined) {
                        $stacktable.addClass(settings.myClass);
                    }
                    $(this).find("td").each(function(index, value) {
                        var row = $("<tr/>");
                        if (index === 0) {
                            row.append($(this).clone(true).addClass("st-head-row").attr("colspan", 2));
                        } else if ($(this).html() !== "") {
                            row.append($topRow.find("td, th").eq(index).clone(true).addClass("st-key"));
                            row.append($(this).clone(true).addClass("st-val"));
                        }
                        $stacktable.append(row);
                    });
                    $table.before($stacktable);
                }
            });
            if (settings.hideOriginal) {
                $table.hide();
            }
        });
    };
})(jQuery);
