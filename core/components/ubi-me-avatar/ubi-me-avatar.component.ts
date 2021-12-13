import { Component, Input, OnInit, HostBinding, OnChanges, OnDestroy, NgZone } from '@angular/core';
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

    private me: any;
    avatarLink: string;

    subscription: Subscription;

    constructor(
        private authService: UbiAuthService,
        private ubiEvent: UbiEventService,
        private ngZone: NgZone,
    ) {
        this.me = authService.me();
        this.updateAvatarLink();

        this.subscription = this.ubiEvent.on(EnumAppConstant.EVENT_UBI_AVATAR_UPDATED, (data) => {
            this.ngZone.run(() => {
                console.log('ubi-me-avatar on event EVENT_UBI_AVATAR_UPDATED');
                this.me = authService.me();
                this.updateAvatarLink();
            });
        });
    }

    private updateAvatarLink() {
        if (this.me && this.me.account) {
            this.avatarLink = this.me.account.avatar_base;
        } else {
            this.avatarLink = null;
        }
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
