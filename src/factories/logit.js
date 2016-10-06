
export default function Logit(style,source) {
    return function logit(...Y){
      console.log('%c%s: %c %s ', style, source, style+'font-weight:bold', ...Y);
	};
}
