import { Directive, Input, HostBinding, AfterViewInit, ElementRef, OnInit, OnChanges } from '@angular/core';


/**
 * Image lazy load directive.
 * ref: https://medium.com/@realTomaszKula/lazy-load-images-in-30-lines-of-code-3fe801223ffa
 *
 * 注意：要使用这个directive，必须添加 intersection observer polyfill，否则对于不支持的浏览器不产生效果
 *
 * @export
 * @class UbiLazyImgDirective
 * @implements {AfterViewInit}
 */
@Directive({
    selector: '[ubi-lazy-img]'
})
export class UbiLazyImgDirective implements OnInit, AfterViewInit, OnChanges {
    @HostBinding('attr.src') srcAttr;
    @Input('data-src') src: string;
    @Input('default-src') defaultSrc: string;

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
        if (this.defaultSrc) {
            this.srcAttr = this.defaultSrc;
        }
    }

    ngAfterViewInit() {
        // this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
        // console.log(this.srcAttr);
    }

    private canLazyLoad() {
        const ret =  window && 'IntersectionObserver' in window;

        if (!ret) {
            console.warn('IntersectionObserver not available. Thus lazy image load does not work.');
        }

        return ret;
    }

    ngOnChanges() {
        this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
    }

    private lazyLoadImage() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(({ isIntersecting }) => {
                if (isIntersecting) {
                    this.loadImage();
                    obs.unobserve(this.el.nativeElement);
                }
            });
        });
        obs.observe(this.el.nativeElement);
    }

    private loadImage() {
        // console.log('UbiLazyImgDirective load image...:', this.src);
        this.srcAttr = this.src;
    }
}
