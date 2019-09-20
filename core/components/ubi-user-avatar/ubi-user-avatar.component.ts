import { Component, Input, OnInit, HostBinding, OnChanges } from '@angular/core';
import { UbiAuthService } from '../../../services/ubi-auth.service';

export interface UbiUserAvatarInfo {
    avatar: string;
    avatar_base: string;
}

/**
 * Generated class for the UserAvatarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'ubi-user-avatar',
    templateUrl: 'ubi-user-avatar.component.html',
    styleUrls: ['ubi-user-avatar.component.scss']
})
export class UbiUserAvatarComponent implements OnInit, OnChanges {

    @Input()
    size = 32;

    @Input()
    logoForEmpty = false;

    @Input()
    rounded = false;

    @Input()
    userAvatarInfo: UbiUserAvatarInfo;

    @HostBinding('style.width') componentWidth;
    @HostBinding('style.height') componentHeight;

    constructor(private authService: UbiAuthService) {
    }


    ngOnInit() {
        // console.log('ngOnInit MeAvatarComponent');
        //
        // console.log(`logoForEmpty=${this.logoForEmpty}`);
    }

    ngOnChanges() {
        this.componentWidth = `${this.size}px`;
        this.componentHeight = `${this.size}px`;
    }
}
