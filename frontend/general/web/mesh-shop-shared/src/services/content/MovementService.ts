export interface JumpState {
    velocity: number;
    jump: boolean;
}
// Heights are camera-eye heights. A queued press is consumed even while airborne.
export function advanceJump(state: JumpState, height: number, floor: number, delta: number) {
    const dt = Math.min(Math.max(delta, 0), 0.05);
    const grounded = height <= floor + 0.015 && state.velocity <= 0;
    if (grounded && state.jump) state.velocity = 6;
    state.jump = false;
    state.velocity -= 16 * dt;
    const next = height + state.velocity * dt;
    if (next < floor) {
        state.velocity = 0;
        return floor;
    }
    return next;
}
