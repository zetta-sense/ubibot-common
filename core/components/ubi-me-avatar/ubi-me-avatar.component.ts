import { Component, Input, OnInit, HostBinding, OnChanges, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { EnumAppConstant } from '../../../enums/enum-app-constant.enum';
import { UbiAuthService } from '../../../services/ubi-auth.service';
import { UbiEventService } from '../../../services/ubi-event.service';

/**
 * Generated class for the MeAvatarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'ubi-me-avatar',
    templateUrl: 'ubi-me-avatar.component.html',
    styleUrls: ['ubi-me-avatar.component.scss']
})
export class UbiMeAvatarComponent implements OnInit, OnDestroy, OnChanges {

    @Input()
    size = 32;

    @Input()
    logoForEmpty = false;

    @Input()
    rounded = false;

    @HostBinding('style.width') componentWidth;
    @HostBinding('style.height') componentHeight;

    me: any;

    subscription: Subscription;

    constructor(
        private authService: UbiAuthService,
        private ubiEvent: UbiEventService,
    ) {
        this.me = authService.me();

        this.subscription = this.ubiEvent.on(EnumAppConstant.EVENT_UBI_AVATAR_UPDATED, (data) => {
            console.log('ubi-me-avatar on event EVENT_UBI_AVATAR_UPDATED');
            this.me = authService.me();
        });
    }


    ngOnInit() {
        // console.log('ngOnInit MeAvatarComponent');
        //
        // console.log(`logoForEmpty=${this.logoForEmpty}`);
    }

    ngOnDestroy() {
        console.log('UbiMeAvatarComponent destroyed...');

        this.subscription.unsubscribe();
    }

    ngOnChanges() {
        this.componentWidth = `${this.size}px`;
        this.componentHeight = `${this.size}px`;
    }
}
