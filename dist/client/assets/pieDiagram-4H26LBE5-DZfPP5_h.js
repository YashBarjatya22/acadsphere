import{g as J,s as Q,a as Y,b as tt,t as et,q as at,_ as u,l as W,c as rt,I as nt,N as it,T as ot,e as st,B as lt,K as ct}from"./mermaid-GHXKKRXX-CbQXx34Q.js";import{p as pt}from"./chunk-4BX2VUAB-DrWMRJNg.js";import{p as ut}from"./wardley-L42UT6IY-BQCOjPEK.js";import{d as P}from"./arc-BnaN4Eqa.js";import{ae as S,a6 as R,aL as dt,aM as gt}from"./index-B6VllQCm.js";import"./index-DVEs1ei3.js";import"./select-DE5gTIcG.js";import"./index-BdQq_4o_.js";import"./index-DEK3bVYX.js";import"./index-BLjnnEQU.js";import"./index-CAV8qA-R.js";import"./index-C7NIJtRN.js";import"./index-0AYDC1-l.js";import"./index-tKhPD8RX.js";import"./circle-BE1Kv1xp.js";import"./input-Bc2M9oi2.js";import"./textarea-DqRBWP6v.js";import"./spinner-DaeUyOlK.js";import"./loader-circle-BThjYuim.js";import"./brain-B0b4eoYg.js";function ft(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function mt(t){return t}function ht(){var t=mt,a=ft,f=null,y=S(0),o=S(R),d=S(0);function s(e){var n,l=(e=dt(e)).length,g,m,v=0,c=new Array(l),i=new Array(l),x=+y.apply(this,arguments),w=Math.min(R,Math.max(-R,o.apply(this,arguments)-x)),h,D=Math.min(Math.abs(w)/l,d.apply(this,arguments)),$=D*(w<0?-1:1),p;for(n=0;n<l;++n)(p=i[c[n]=n]=+t(e[n],n,e))>0&&(v+=p);for(a!=null?c.sort(function(A,C){return a(i[A],i[C])}):f!=null&&c.sort(function(A,C){return f(e[A],e[C])}),n=0,m=v?(w-l*$)/v:0;n<l;++n,x=h)g=c[n],p=i[g],h=x+(p>0?p*m:0)+$,i[g]={data:e[g],index:n,value:p,startAngle:x,endAngle:h,padAngle:D};return i}return s.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),s):t},s.sortValues=function(e){return arguments.length?(a=e,f=null,s):a},s.sort=function(e){return arguments.length?(f=e,a=null,s):f},s.startAngle=function(e){return arguments.length?(y=typeof e=="function"?e:S(+e),s):y},s.endAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),s):o},s.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:S(+e),s):d},s}var vt=ct.pie,z={sections:new Map,showData:!1},T=z.sections,F=z.showData,xt=structuredClone(vt),St=u(()=>structuredClone(xt),"getConfig"),yt=u(()=>{T=new Map,F=z.showData,lt()},"clear"),wt=u(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),W.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),At=u(()=>T,"getSections"),Ct=u(t=>{F=t},"setShowData"),Dt=u(()=>F,"getShowData"),_={getConfig:St,clear:yt,setDiagramTitle:at,getDiagramTitle:et,setAccTitle:tt,getAccTitle:Y,setAccDescription:Q,getAccDescription:J,addSection:wt,getSections:At,setShowData:Ct,getShowData:Dt},$t=u((t,a)=>{pt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),Tt={parse:u(async t=>{const a=await ut("pie",t);W.debug(a),$t(a,_)},"parse")},Mt=u(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),bt=Mt,kt=u(t=>{const a=[...t.values()].reduce((o,d)=>o+d,0),f=[...t.entries()].map(([o,d])=>({label:o,value:d})).filter(o=>o.value/a*100>=1);return ht().value(o=>o.value).sort(null)(f)},"createPieArcs"),Et=u((t,a,f,y)=>{W.debug(`rendering pie chart
`+t);const o=y.db,d=rt(),s=nt(o.getConfig(),d.pie),e=40,n=18,l=4,g=450,m=g,v=it(a),c=v.append("g");c.attr("transform","translate("+m/2+","+g/2+")");const{themeVariables:i}=d;let[x]=ot(i.pieOuterStrokeWidth);x??=2;const w=s.textPosition,h=Math.min(m,g)/2-e,D=P().innerRadius(0).outerRadius(h),$=P().innerRadius(h*w).outerRadius(h*w);c.append("circle").attr("cx",0).attr("cy",0).attr("r",h+x/2).attr("class","pieOuterCircle");const p=o.getSections(),A=kt(p),C=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let M=0;p.forEach(r=>{M+=r});const L=A.filter(r=>(r.data.value/M*100).toFixed(0)!=="0"),b=gt(C).domain([...p.keys()]);c.selectAll("mySlices").data(L).enter().append("path").attr("d",D).attr("fill",r=>b(r.data.label)).attr("class","pieCircle"),c.selectAll("mySlices").data(L).enter().append("text").text(r=>(r.data.value/M*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const V=c.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),N=[...p.entries()].map(([r,E])=>({label:r,value:E})),k=c.selectAll(".legend").data(N).enter().append("g").attr("class","legend").attr("transform",(r,E)=>{const O=n+l,X=O*N.length/2,Z=12*n,H=E*O-X;return"translate("+Z+","+H+")"});k.append("rect").attr("width",n).attr("height",n).style("fill",r=>b(r.label)).style("stroke",r=>b(r.label)),k.append("text").attr("x",n+l).attr("y",n-l).text(r=>o.getShowData()?`${r.label} [${r.value}]`:r.label);const U=Math.max(...k.selectAll("text").nodes().map(r=>r?.getBoundingClientRect().width??0)),j=m+e+n+l+U,B=V.node()?.getBoundingClientRect().width??0,q=m/2-B/2,K=m/2+B/2,G=Math.min(0,q),I=Math.max(j,K)-G;v.attr("viewBox",`${G} 0 ${I} ${g}`),st(v,g,I,s.useMaxWidth)},"draw"),Rt={draw:Et},Yt={parser:Tt,db:_,renderer:Rt,styles:bt};export{Yt as diagram};
