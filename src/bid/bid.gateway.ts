import { OnModuleInit, UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@WebSocketGateway({
  cors: '*'
})
export class BidGateway implements OnModuleInit {

  @WebSocketServer()
  public server: Server;

  onModuleInit() {
    this.server.on("connection", (socket: Socket) => {
      console.log("client connected", socket.handshake.headers);

      this.server.on("disconnect", () => {
        console.log("client disconnected ", socket.id);
      })
    })
  }

  @SubscribeMessage('on-bid-placed')
  handleOnBidPlaced(@MessageBody() bid: any) {
    this.server.emit('on-bid-placed', bid);
  }
}
