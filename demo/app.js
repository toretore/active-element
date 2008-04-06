if (!window.console) {
  window.console = {
    log: function(){}
  };
} else if (!window.console.log) {
  window.console.log = function(){};
}


Demo = {};
