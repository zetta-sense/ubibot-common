import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'ubiUserDisplay'
})
export class UbiUserDisplayPipe implements PipeTransform {

    transform(value: any, args?: any): any {

        if (value && value.email_status == 'live') {
            return value.email;
        } else if (value && value.mobile_status == 'live') {
            return value.mobile;
        } else if (value) {
            return value.username;
        }
        return null;
    }

}
