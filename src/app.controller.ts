import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {

    @Get("health-check")
    async getBidsByAuctionId() {
        return 'health check';
    }


}
