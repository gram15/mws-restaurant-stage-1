 /**
  * App Helper class
  */
class AppHelper {

  /**
  * Starts Service worker
  */
  static startServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        if (!navigator.serviceWorker.controller) {
          return;
        }
        // waiting
        if (reg.waiting) {
          var worker = reg.waiting;
          worker.postMessage({
            action: 'skipWaiting'
          });
          return;
        }
        //installing
        if (reg.installing) {
          var worker = reg.installing;
          worker.addEventListener('statechange', () => {
            if (worker.state == 'installed') {
              worker.postMessage({
                action: 'skipWaiting'
              });
            }
          });
          return;
        }
        // update found
        reg.addEventListener('updatefound', () => {
          var worker = reg.installing;
          worker.addEventListener('statechange', () => {
            if (worker.state == 'installed') {
              worker.postMessage({
                action: 'skipWaiting'
              });
            }
          });
        });
      });
      // refreshing
      var refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    }
  }


  /**
  * @description Change image suffix name based on string 
  * @param {string} filename - Name of file to change
  * @param {string} string - Suffix to append
  */
  static setSuffixToFile(filename, string) {
    var dotIndex = filename.lastIndexOf(".");
    if (dotIndex == -1) return filename + string;
    else return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
  }
}