import {Component, Input, OnInit} from '@angular/core';
import { UbiAuthService } from 'src/modules/ubibot-common/services/ubi-auth.service';

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
export class UbiMeAvatarComponent implements OnInit {

    @Input() size = 32;
    @Input() logoForEmpty = false;
    @Input() rounded = false;

    me: any;

    constructor(private authService: UbiAuthService) {
        this.me = authService.me();
    }


    ngOnInit() {
        console.log(this.rounded);
        // console.log('ngOnInit MeAvatarComponent');
        //
        // console.log(`logoForEmpty=${this.logoForEmpty}`);
    }

}
