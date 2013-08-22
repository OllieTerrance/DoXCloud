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
 * This version has been modified for a custom table
 * layout (one table per row of original table).
 *
 */

;(function($) {

  $.fn.stacktable = function(options) {
    var $tables = this,
        defaults = {id:'stacktable',hideOriginal:false},
        settings = $.extend({}, defaults, options),
        stacktable;

    return $tables.each(function() {
      $table = $(this);
      $topRow = $table.find('tr').eq(0);
      $table.find('tr').each(function(index,value) {
        if (index>0) {
          var $stacktable = $('<table class="'+settings.id+'"><tbody></tbody></table>');
          if (typeof settings.myClass !== undefined) $stacktable.addClass(settings.myClass);
          var markup = '';
          markup += '<tr>';
          $(this).find('td').each(function(index,value) {
            if (index===0) {
              markup += '<tr><th class="st-head-row" colspan="2">'+$(this).html()+'</th></tr>';
            } else {
              if ($(this).html() !== ''){
                markup += '<tr>';
                if ($topRow.find('td,th').eq(index).html()){
                  markup += '<td class="st-key">'+$topRow.find('td,th').eq(index).html()+'</td>';
                } else {
                  markup += '<td class="st-key"></td>';
                }
                markup += '<td class="st-val">'+$(this).html()+'</td>';
                markup += '</tr>';
              }
            }
          });
          $stacktable.append($(markup));
          $table.before($stacktable);
        }
      });
      if (settings.hideOriginal) $table.hide();
    });
  };

}(jQuery));
