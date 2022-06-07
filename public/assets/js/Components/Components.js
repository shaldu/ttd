import { Types, Component } from 'ecsy';

export class Acceleration extends Component {}

Acceleration.schema = {
    value: { type: Types.Number, default: 1 }
};

export class Position extends Component {}

Position.schema = {
    x: { type: Types.Number, default: 0 },
    y: { type: Types.Number, default: 0 },
    z: { type: Types.Number, default: 0 }
};


export class Sprite extends Component {

}

Sprite.schema = {
    offSetX: { type: Types.Number, default: 1 },
    offSetY: { type: Types.Number, default: 1 },
    scene: { type: Types.Ref },
    textureUrl: { type: Types.String, default: null },
    texture: { type: Types.Ref, default: null },
    mesh: { type: Types.Ref },
    width: { type: Types.Number, default: 1 },
    height: { type: Types.Number, default: 1 },
    loop: { type: Types.Boolean, default: false },
    frameRate: { type: Types.Number, default: 0.05 },
    frame: { type: Types.Number, default: 0 },
    frameCount: { type: Types.Number, default: 1 },
    frameWidth: { type: Types.Number, default: 32 },
    frameHeight: { type: Types.Number, default: 32 },
    frameOffsetX: { type: Types.Number, default: 0 },
    frameOffsetY: { type: Types.Number, default: 0 },
    frameTime: { type: Types.Number, default: 0 },
}

export class Burning extends Component {}

Burning.schema = {
    isBurning: { type: Types.Boolean, default: false },
    currentBurnTime: { type: Types.Number, default: 0 },
    maxBurnTime: { type: Types.Number, default: 20 },
    burnDamage: { type: Types.Number, default: 10 },
    tile: { type: Types.Ref }
};