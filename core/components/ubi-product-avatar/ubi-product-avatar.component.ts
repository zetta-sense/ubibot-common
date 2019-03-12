import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { UbiUtilsService } from '../../../services/ubi-utils.service';
import { UbibotCommonConfigService } from '../../../providers/ubibot-common-config.service';
import { EnumBasicProductId } from '../../../enums/enum-basic-product-id.enum';

/**
 * Generated class for the ProductAvatarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'ubi-product-avatar',
    templateUrl: 'ubi-product-avatar.component.html',
    styleUrls: ['ubi-product-avatar.component.scss']
})
export class UbiProductAvatarComponent implements OnInit, OnChanges {

    @Input() size = 128;
    @Input() productId;

    avatarImage: string;

    constructor(private ubiUtils: UbiUtilsService,
                private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.updateAvatarImage();
    }

    updateAvatarImage() {
        let family = this.ubiUtils.detectProductFamily(this.productId);
        if(family == EnumBasicProductId.WS1) {
            this.avatarImage = 'assets/images/avatar-ubibot-ws1.png';
        }else if(family == EnumBasicProductId.WS1P) {
            this.avatarImage = 'assets/images/avatar-ubibot-ws1p.png';
        }else {
            this.avatarImage = this.ubibotCommonConfig.LogoFile;
        }
    }

    ngOnInit() {
        // this.updateAvatarImage();
    }

}
