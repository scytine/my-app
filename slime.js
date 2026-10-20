/* Slime hero background: dents on click/drag and on scroll */
var Slime=(function(){
    var cv=document.getElementById('slime'),ctx=cv.getContext('2d'),box=document.getElementById('heroBox'),C=7,W=0,H=0,h,v,b,img,down=false,vis=true,lastY=window.scrollY,rt;
    function size(){var r=box.getBoundingClientRect();if(r.width<10)return;W=Math.ceil(r.width/C);H=Math.ceil(r.height/C);cv.width=W;cv.height=H;h=new Float32Array(W*H);v=new Float32Array(W*H);b=new Float32Array(W*H);img=ctx.createImageData(W,H);for(var y=0;y<H;y++)for(var x=0;x<W;x++)b[y*W+x]=Math.sin(x*.09+Math.sin(y*.06)*2.2)*Math.cos(y*.11+x*.03)*5+Math.sin((x+y)*.045)*3.5}
    function dent(gx,gy,r,s){if(!h)return;var x0=Math.max(1,Math.floor(gx-r*2)),x1=Math.min(W-2,Math.ceil(gx+r*2)),y0=Math.max(1,Math.floor(gy-r*2)),y1=Math.min(H-2,Math.ceil(gy+r*2));for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++){var dx=x-gx,dy=y-gy;h[y*W+x]-=s*Math.exp(-(dx*dx+dy*dy)/(r*r))}}
    function at(e,k){var r=cv.getBoundingClientRect();if(!r.width)return;dent((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H,5+3*k,12*k)}
    function frame(){
      if(h&&vis){
        var i,x,y,d=img.data;
        for(y=1;y<H-1;y++)for(x=1;x<W-1;x++){i=y*W+x;v[i]=(v[i]+(h[i-1]+h[i+1]+h[i-W]+h[i+W]-4*h[i])*.06-h[i]*.0012)*.84}
        for(y=1;y<H-1;y++)for(x=1;x<W-1;x++){i=y*W+x;h[i]+=v[i]}
        for(y=1;y<H-1;y++)for(x=1;x<W-1;x++){
          i=y*W+x;
          var gx=(h[i+1]+b[i+1]-h[i-1]-b[i-1])*.3,gy=(h[i+W]+b[i+W]-h[i-W]-b[i-W])*.3,il=1/Math.sqrt(gx*gx+gy*gy+1),nx=-gx*il,ny=-gy*il,nz=il;
          var dif=nx*-.45+ny*-.55+nz*.7-.7,sp=nx*-.25+ny*-.3+nz*.92;sp=sp>0?Math.pow(sp,38):0;
          var wa=Math.max(dif>0?dif*380:0,sp*255),da=dif<0?-dif*420:0,p=i*4;
          if(wa>da){d[p]=d[p+1]=d[p+2]=255;d[p+3]=Math.min(210,wa)}else{d[p]=20;d[p+1]=0;d[p+2]=70;d[p+3]=Math.min(150,da)}
        }
        ctx.putImageData(img,0,0);
      }
      requestAnimationFrame(frame);
    }
    box.addEventListener('pointerdown',function(e){if(e.target.closest('button,a'))return;down=true;at(e,1)});
    box.addEventListener('pointermove',function(e){if(e.target.closest('button,a'))return;at(e,down?.7:.12)});
    window.addEventListener('pointerup',function(){down=false});
    window.addEventListener('scroll',function(){
      var y=window.scrollY,dy=Math.abs(y-lastY);lastY=y;if(!vis||dy<2||!h)return;
      var r=cv.getBoundingClientRect(),a=Math.min(dy,70)/70,gy=(window.innerHeight*.5-r.top)/r.height*H;
      for(var k=0;k<3;k++)dent(W*(.15+.3*k+Math.random()*.12),gy+(Math.random()-.5)*4,4+a*5,6+a*9);
    },{passive:true});
    window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150)});
    if(window.IntersectionObserver)new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(box);
    size();requestAnimationFrame(frame);
    return {resize:size};
  })();
