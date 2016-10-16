/* global debug */
import debug from 'debug';
window.mydebug = debug;
export default function Logit(style,source) {
  let debb = debug(`steds:${source}`);


// debug.enable('*');
    return function logit(...Y){
      // debb(...Y);
      // debb('%c %s ', 'font-weight:bold', ...Y);
      // debb('%c %s ', style+'font-weight:bold', ...Y);
      console.log('%c%s: %c %s ', style, source, style+'font-weight:bold', ...Y);
	};
}
