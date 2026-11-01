package com.agrishield.service;

import org.springframework.stereotype.Service;
import java.util.Locale;

/** Server-side SVG chart renderer. This replaces the project's Chart.js application logic. */
@Service
public class ChartSvgService {
    private static final String TEXT = "#94A3B8";
    private static final String GREEN = "#10B981";
    private static final String GOLD = "#F59E0B";

    public String heroChart() {
        double[] values = {0.5, -0.9, -1.0, -0.8, 0.8, 1.5, 1.8};
        String[] labels = {"2019", "2020", "2021", "2022", "2023", "2024", "2025"};
        int w = 360, h = 95, left = 8, right = 8, top = 8, bottom = 8;
        StringBuilder s = svgStart(w, h, "ONI SST anomaly historical sparkline");
        s.append(polyline(values, -1.2, 2.0, left, top, w-left-right, h-top-bottom, GREEN, 2.5, false));
        return svgEnd(s);
    }

    public String rainfallChart() {
        double[] deficit = {-12, 5, 2, -8, -18, -24, -20};
        double[] oni = {0.5, -0.4, -0.8, -0.6, 1.2, 1.6, 1.8};
        String[] labels = {"2019", "2020", "2021", "2022", "2023", "2024", "2025 (E)"};
        int w=680,h=300,left=48,right=42,top=18,bottom=42;
        StringBuilder s=svgStart(w,h,"Historical rainfall deficit and ONI index chart");
        int plotW=w-left-right, plotH=h-top-bottom;
        for (int i=0;i<5;i++) {
            int y=top+i*plotH/4;
            s.append(String.format(Locale.US,"<line x1='%d' y1='%d' x2='%d' y2='%d' stroke='rgba(255,255,255,.08)'/><text x='%d' y='%d' fill='%s' font-size='11' text-anchor='end'>%d</text>",left,y,w-right,y,left-8,y+4,TEXT,20-i*10));
        }
        for(int i=0;i<deficit.length;i++) {
            int x=left+(i*plotW/(deficit.length));
            int bw= Math.max(18, plotW/deficit.length-12);
            double zeroY=top+plotH/2.0;
            double scale=plotH/50.0;
            double valH=Math.abs(deficit[i])*scale;
            double y=deficit[i] < 0 ? zeroY : zeroY-valH;
            s.append(String.format(Locale.US,"<rect x='%d' y='%.1f' width='%d' height='%.1f' rx='4' fill='%s' opacity='.9'/>",x+bw/5,y,bw,valH,GREEN));
            s.append(String.format(Locale.US,"<text x='%d' y='%d' fill='%s' font-size='11' text-anchor='middle'>%s</text>",x+bw/2+3,h-18,TEXT,labels[i]));
        }
        s.append(polyline(oni,-1.0,2.0,left+12,top+8,plotW-24,plotH-16,GOLD,3,false));
        s.append(String.format(Locale.US,"<line x1='%d' y1='%d' x2='%d' y2='%d' stroke='%s' stroke-width='3'/><text x='%d' y='%d' fill='%s' font-size='12'>Rainfall deficit (%)</text>",left+6,h-3,left+22,h-3,GREEN,left+28,h-1,TEXT));
        s.append(String.format(Locale.US,"<line x1='%d' y1='%d' x2='%d' y2='%d' stroke='%s' stroke-width='3'/><text x='%d' y='%d' fill='%s' font-size='12'>ONI (°C)</text>",w-170,h-3,w-154,h-3,GOLD,w-148,h-1,TEXT));
        return svgEnd(s);
    }

    public String claimsDonutChart() {
        double[] vals={58,22,14,6};
        String[] colors={"#EF4444",GREEN,GOLD,"#64748B"};
        String[] labels={"Drought Loss","Excess Rain","Pest Attack","Other Risks"};
        int w=440,h=300,cx=220,cy=125,r=78,inner=45;
        StringBuilder s=svgStart(w,h,"Historical claim distribution doughnut chart");
        double start=-90;
        for(int i=0;i<vals.length;i++) {
            double end=start+vals[i]*3.6;
            s.append(donutSegment(cx,cy,r,inner,start,end,colors[i]));
            start=end;
        }
        int lx=28,ly=235;
        for(int i=0;i<labels.length;i++) {
            int x=lx+(i%2)*205, y=ly+(i/2)*28;
            s.append(String.format(Locale.US,"<rect x='%d' y='%d' width='10' height='10' rx='2' fill='%s'/><text x='%d' y='%d' fill='%s' font-size='12'>%s (%d%%)</text>",x,y-9,colors[i],x+16,y,TEXT,labels[i],(int)vals[i]));
        }
        return svgEnd(s);
    }

    public String pmfChart(int n, double p) {
        n=Math.max(1,Math.min(n,100000)); p=Math.max(.0001,Math.min(.9999,p));
        int expected=(int)Math.round(n*p), range=15;
        int start=Math.max(0,expected-range), end=Math.min(n,expected+range);
        double sd=Math.sqrt(n*p*(1-p));
        int w=640,h=220,left=44,right=18,top=15,bottom=42;
        StringBuilder s=svgStart(w,h,"Approximate binomial claims distribution probability mass function");
        int count=Math.max(1,end-start); double max=0; double[] vals=new double[count+1];
        for(int i=0;i<=count;i++){int k=start+i; vals[i]=(1.0/(sd*Math.sqrt(2*Math.PI)))*Math.exp(-.5*Math.pow((k-expected)/sd,2));max=Math.max(max,vals[i]);}
        int pw=w-left-right,ph=h-top-bottom;
        s.append(String.format(Locale.US,"<line x1='%d' y1='%d' x2='%d' y2='%d' stroke='rgba(255,255,255,.16)'/>",left,top+ph,w-right,top+ph));
        StringBuilder points=new StringBuilder();
        for(int i=0;i<vals.length;i++){
            double x=left+(double)i/count*pw; double y=top+ph-(max==0?0:vals[i]/max*ph*.9);
            points.append(String.format(Locale.US,"%.1f,%.1f ",x,y));
            if(i%5==0 || i==vals.length-1) s.append(String.format(Locale.US,"<text x='%.1f' y='%d' fill='%s' font-size='10' text-anchor='middle'>%d</text>",x,h-20,TEXT,start+i));
        }
        s.append("<polyline points='").append(points).append("' fill='none' stroke='").append(GREEN).append("' stroke-width='2.5' stroke-linejoin='round'/>");
        s.append(String.format(Locale.US,"<text x='%d' y='%d' fill='%s' font-size='11'>Number of claims (k)</text>",w/2-55,h-3,TEXT));
        return svgEnd(s);
    }

    private StringBuilder svgStart(int w,int h,String title){return new StringBuilder(String.format(Locale.US,"<svg xmlns='http://www.w3.org/2000/svg' role='img' aria-label='%s' viewBox='0 0 %d %d' width='100%%' height='100%%' preserveAspectRatio='xMidYMid meet'>",title,w,h));}
    private String svgEnd(StringBuilder s){return s.append("</svg>").toString();}
    private String polyline(double[] v,double min,double max,int x,int y,int w,int h,String color,double stroke,boolean close){
        StringBuilder pts=new StringBuilder();
        for(int i=0;i<v.length;i++){double px=x+(v.length==1?0:(double)i/(v.length-1)*w);double py=y+h-(v[i]-min)/(max-min)*h;pts.append(String.format(Locale.US,"%.1f,%.1f ",px,py));}
        StringBuilder out=new StringBuilder();
        if(close) out.append(String.format(Locale.US,"<polygon points='%d,%d %s %d,%d' fill='%s' opacity='.15'/>",x,y+h,pts,x+w,y+h,color));
        out.append(String.format(Locale.US,"<polyline points='%s' fill='none' stroke='%s' stroke-width='%.1f' stroke-linecap='round' stroke-linejoin='round'/>",pts,color,stroke));
        return out.toString();
    }
    private String donutSegment(double cx,double cy,double r,double inner,double start,double end,String color){
        double sx=cx+r*Math.cos(Math.toRadians(start)), sy=cy+r*Math.sin(Math.toRadians(start));
        double ex=cx+r*Math.cos(Math.toRadians(end)), ey=cy+r*Math.sin(Math.toRadians(end));
        double isx=cx+inner*Math.cos(Math.toRadians(end)), isy=cy+inner*Math.sin(Math.toRadians(end));
        double iex=cx+inner*Math.cos(Math.toRadians(start)), iey=cy+inner*Math.sin(Math.toRadians(start));
        int large=end-start>180?1:0;
        return String.format(Locale.US,"<path d='M %.2f %.2f A %.2f %.2f 0 %d 1 %.2f %.2f L %.2f %.2f A %.2f %.2f 0 %d 0 %.2f %.2f Z' fill='%s' stroke='#0f172a' stroke-width='2'/>",sx,sy,r,r,large,ex,ey,isx,isy,inner,inner,large,iex,iey,color);
    }
}
