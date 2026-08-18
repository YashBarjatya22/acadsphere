import{s as k,g as I,t as R,q as _,a as E,b as F,_ as l,N as D,B as G,I as y,G as C,K as z,l as P,O as B,e as W}from"./mermaid-GHXKKRXX-BnEbfZyU.js";import{p as V}from"./chunk-4BX2VUAB-r3ftM_Ee.js";import{p as H}from"./wardley-L42UT6IY-BVWqXVvB.js";import"./index-Djmlwups.js";import"./useQuery-BJsSgcNv.js";import"./createServerFn-DhtWdWYi.js";import"./ChatLayout-C5Tm8Y39.js";import"./useMutation-CY3xv-wF.js";import"./auth-middleware-Cit-w9rV.js";import"./button-CM0VBfXW.js";import"./index-Dxg9GlAE.js";import"./clsx-B-dksMZM.js";import"./utils-bRMfwS6c.js";import"./studentos-logo-PYFVF9SM.js";import"./avatar-BXyiVNN7.js";import"./createLucideIcon-8P02BoQ4.js";import"./x-B4_39sJ4.js";import"./sun-C0EQ_Z9z.js";import"./graduation-cap-CHnPVeFI.js";import"./radio-C9yxx6A7.js";import"./trending-up-BRyIQxHx.js";import"./megaphone-Cdw0Hmyz.js";import"./file-text-CReasyMj.js";import"./lock-CAC4s0_c.js";import"./wand-sparkles-D27spgar.js";import"./user-BVSDjV8w.js";import"./circle-check-DNCIHdHm.js";import"./log-out-HN48gxx1.js";import"./search-Bs1CvZhm.js";import"./index-CdDiwsEQ.js";import"./select-Bx9RA2AD.js";import"./index-BAzTlRte.js";import"./index-HIzwYys4.js";import"./chevron-down-B4nnoRZu.js";import"./check-BiaiY2Ch.js";import"./index-DVT1FIvZ.js";import"./string-DAaY_9R9.js";import"./index-DDnAeLnW.js";import"./chevron-right-iqG02GmG.js";import"./circle-DR3y_L-0.js";import"./input-HZj5be4i.js";import"./textarea-BDesii-Y.js";import"./spinner-CDEyNSm4.js";import"./loader-circle-L3fG5rfA.js";import"./brain-a5wKnlq3.js";var x={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},w={axes:[],curves:[],options:x},g=structuredClone(w),j=z.radar,N=l(()=>y({...j,...C().radar}),"getConfig"),b=l(()=>g.axes,"getAxes"),q=l(()=>g.curves,"getCurves"),K=l(()=>g.options,"getOptions"),U=l(r=>{g.axes=r.map(t=>({name:t.name,label:t.label??t.name}))},"setAxes"),X=l(r=>{g.curves=r.map(t=>({name:t.name,label:t.label??t.name,entries:Y(t.entries)}))},"setCurves"),Y=l(r=>{if(r[0].axis==null)return r.map(e=>e.value);const t=b();if(t.length===0)throw new Error("Axes must be populated before curves for reference entries");return t.map(e=>{const a=r.find(o=>o.axis?.$refText===e.name);if(a===void 0)throw new Error("Missing entry for axis "+e.label);return a.value})},"computeCurveEntries"),Z=l(r=>{const t=r.reduce((e,a)=>(e[a.name]=a,e),{});g.options={showLegend:t.showLegend?.value??x.showLegend,ticks:t.ticks?.value??x.ticks,max:t.max?.value??x.max,min:t.min?.value??x.min,graticule:t.graticule?.value??x.graticule}},"setOptions"),J=l(()=>{G(),g=structuredClone(w)},"clear"),$={getAxes:b,getCurves:q,getOptions:K,setAxes:U,setCurves:X,setOptions:Z,getConfig:N,clear:J,setAccTitle:F,getAccTitle:E,setDiagramTitle:_,getDiagramTitle:R,getAccDescription:I,setAccDescription:k},Q=l(r=>{V(r,$);const{axes:t,curves:e,options:a}=r;$.setAxes(t),$.setCurves(e),$.setOptions(a)},"populate"),tt={parse:l(async r=>{const t=await H("radar",r);P.debug(t),Q(t)},"parse")},et=l((r,t,e,a)=>{const o=a.db,i=o.getAxes(),n=o.getCurves(),s=o.getOptions(),c=o.getConfig(),p=o.getDiagramTitle(),d=D(t),m=rt(d,c),u=s.max??Math.max(...n.map(f=>Math.max(...f.entries))),h=s.min,v=Math.min(c.width,c.height)/2;at(m,i,v,s.ticks,s.graticule),ot(m,i,v,c),M(m,i,n,h,u,s.graticule,c),T(m,n,s.showLegend,c),m.append("text").attr("class","radarTitle").text(p).attr("x",0).attr("y",-c.height/2-c.marginTop)},"draw"),rt=l((r,t)=>{const e=t.width+t.marginLeft+t.marginRight,a=t.height+t.marginTop+t.marginBottom,o={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return W(r,a,e,t.useMaxWidth??!0),r.attr("viewBox",`0 0 ${e} ${a}`),r.append("g").attr("transform",`translate(${o.x}, ${o.y})`)},"drawFrame"),at=l((r,t,e,a,o)=>{if(o==="circle")for(let i=0;i<a;i++){const n=e*(i+1)/a;r.append("circle").attr("r",n).attr("class","radarGraticule")}else if(o==="polygon"){const i=t.length;for(let n=0;n<a;n++){const s=e*(n+1)/a,c=t.map((p,d)=>{const m=2*d*Math.PI/i-Math.PI/2,u=s*Math.cos(m),h=s*Math.sin(m);return`${u},${h}`}).join(" ");r.append("polygon").attr("points",c).attr("class","radarGraticule")}}},"drawGraticule"),ot=l((r,t,e,a)=>{const o=t.length;for(let i=0;i<o;i++){const n=t[i].label,s=2*i*Math.PI/o-Math.PI/2;r.append("line").attr("x1",0).attr("y1",0).attr("x2",e*a.axisScaleFactor*Math.cos(s)).attr("y2",e*a.axisScaleFactor*Math.sin(s)).attr("class","radarAxisLine"),r.append("text").text(n).attr("x",e*a.axisLabelFactor*Math.cos(s)).attr("y",e*a.axisLabelFactor*Math.sin(s)).attr("class","radarAxisLabel")}},"drawAxes");function M(r,t,e,a,o,i,n){const s=t.length,c=Math.min(n.width,n.height)/2;e.forEach((p,d)=>{if(p.entries.length!==s)return;const m=p.entries.map((u,h)=>{const v=2*Math.PI*h/s-Math.PI/2,f=A(u,a,o,c),O=f*Math.cos(v),S=f*Math.sin(v);return{x:O,y:S}});i==="circle"?r.append("path").attr("d",L(m,n.curveTension)).attr("class",`radarCurve-${d}`):i==="polygon"&&r.append("polygon").attr("points",m.map(u=>`${u.x},${u.y}`).join(" ")).attr("class",`radarCurve-${d}`)})}l(M,"drawCurves");function A(r,t,e,a){const o=Math.min(Math.max(r,t),e);return a*(o-t)/(e-t)}l(A,"relativeRadius");function L(r,t){const e=r.length;let a=`M${r[0].x},${r[0].y}`;for(let o=0;o<e;o++){const i=r[(o-1+e)%e],n=r[o],s=r[(o+1)%e],c=r[(o+2)%e],p={x:n.x+(s.x-i.x)*t,y:n.y+(s.y-i.y)*t},d={x:s.x-(c.x-n.x)*t,y:s.y-(c.y-n.y)*t};a+=` C${p.x},${p.y} ${d.x},${d.y} ${s.x},${s.y}`}return`${a} Z`}l(L,"closedRoundCurve");function T(r,t,e,a){if(!e)return;const o=(a.width/2+a.marginRight)*3/4,i=-(a.height/2+a.marginTop)*3/4,n=20;t.forEach((s,c)=>{const p=r.append("g").attr("transform",`translate(${o}, ${i+c*n})`);p.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${c}`),p.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(s.label)})}l(T,"drawLegend");var st={draw:et},it=l((r,t)=>{let e="";for(let a=0;a<r.THEME_COLOR_LIMIT;a++){const o=r[`cScale${a}`];e+=`
		.radarCurve-${a} {
			color: ${o};
			fill: ${o};
			fill-opacity: ${t.curveOpacity};
			stroke: ${o};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${a} {
			fill: ${o};
			fill-opacity: ${t.curveOpacity};
			stroke: ${o};
		}
		`}return e},"genIndexStyles"),nt=l(r=>{const t=B(),e=C(),a=y(t,e.themeVariables),o=y(a.radar,r);return{themeVariables:a,radarOptions:o}},"buildRadarStyleOptions"),lt=l(({radar:r}={})=>{const{themeVariables:t,radarOptions:e}=nt(r);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${e.axisColor};
		stroke-width: ${e.axisStrokeWidth};
	}
	.radarAxisLabel {
		dominant-baseline: middle;
		text-anchor: middle;
		font-size: ${e.axisLabelFontSize}px;
		color: ${e.axisColor};
	}
	.radarGraticule {
		fill: ${e.graticuleColor};
		fill-opacity: ${e.graticuleOpacity};
		stroke: ${e.graticuleColor};
		stroke-width: ${e.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${e.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${it(t,e)}
	`},"styles"),te={parser:tt,db:$,renderer:st,styles:lt};export{te as diagram};
