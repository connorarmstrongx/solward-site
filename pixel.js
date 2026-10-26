/* Meta Pixel (Facebook and Instagram ads measurement).
 * Pixel ID 1059950200339050. Loaded on every page; the Lead event is fired from app.js
 * when a quote request or contact message is sent successfully. */
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
var go=function(){s.parentNode.insertBefore(t,s)};
/* load after the page has finished, so it never competes with first paint */
if(b.readyState==='complete')go();else f.addEventListener('load',function(){setTimeout(go,0)})}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1059950200339050');
fbq('track', 'PageView');
