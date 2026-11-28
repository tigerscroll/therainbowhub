export const quizStartSelector = "[data-quiz-start]";

type StartBridge = { key: string; take: () => boolean };
type StartWindow = Window & { quizStartBridge?: StartBridge };

// Capture Start even before React can see a click. Holding just one intent
// means repeated taps still produce one rewarded request after hydration.
export function quizStartBridgeScript(key: string) {
  return `(function(){
    var clicked=false;
    var previous=window.quizStartBridge;
    if(previous)previous.take();
    function capture(event){
      var button=event.target?.closest?.(${JSON.stringify(quizStartSelector)});
      if(!button||button.disabled||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      clicked=true;
      event.preventDefault();
      event.stopPropagation();
    }
    var bridge={
      key:${JSON.stringify(key).replace(/</g, "\\u003c")},
      take:function(){
        document.removeEventListener("click",capture,true);
        if(window.quizStartBridge===bridge)delete window.quizStartBridge;
        return clicked;
      }
    };
    window.quizStartBridge=bridge;
    document.addEventListener("click",capture,true);
  })();`;
}

export function takeEarlyQuizStart(key: string) {
  const bridge = (window as StartWindow).quizStartBridge;
  return bridge?.key === key && bridge.take();
}
