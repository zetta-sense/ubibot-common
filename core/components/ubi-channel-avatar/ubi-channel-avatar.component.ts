import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { UbiUtilsService } from '../../../services/ubi-utils.service';
import { UbibotCommonConfigService } from '../../../providers/ubibot-common-config.service';
import { UbiChannel } from '../../../entities/ubi-channel.entity';

/**
 * Generated class for the UbiChannelAvatarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'ubi-channel-avatar',
    templateUrl: 'ubi-channel-avatar.component.html',
    styleUrls: ['ubi-channel-avatar.component.scss']
})
export class UbiChannelAvatarComponent implements OnInit, OnChanges {

    @Input()
    size = 128;

    @Input()
    rounded = false;

    @Input()
    channel: UbiChannel;

    avatarImage: string;

    constructor(private ubiUtils: UbiUtilsService,
                private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.updateAvatarImage();
    }

    updateAvatarImage() {
        if(this.channel) {
            this.avatarImage = this.channel.c_icon_base;
        }
    }

    ngOnInit() {
        // this.updateAvatarImage();
    }

}
