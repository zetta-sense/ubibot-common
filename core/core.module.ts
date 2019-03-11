import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UbiMeAvatarComponent } from './components/ubi-me-avatar/ubi-me-avatar.component';
import { ResourceUrlPipe } from './pipes/resource-url.pipe';
import { UbiUserDisplayPipe } from './pipes/ubi-user-display.pipe';

@NgModule({
    declarations: [
        UbiUserDisplayPipe, // 必须，否则会抛出module not determined错误
        ResourceUrlPipe,
        UbiMeAvatarComponent,
    ],
    exports: [
        UbiMeAvatarComponent,
    ],
    providers: [ // 用于DI
        UbiUserDisplayPipe,
        ResourceUrlPipe,
    ],
    imports: [
        CommonModule
    ]
})
export class UbiCoreModule { }
