import * as React from "react";

export type HandleProps = {
    x: number,
    y: number,
} & React.SVGProps<SVGCircleElement>;

const Handle: React.SFC<HandleProps> = ({ x, y, ...args }) => {
    return <circle cx={x} cy={y} r={5} style={{ fill: "transparent", stroke: "red", strokeWidth: 2 }} {...args} />
}

export interface DraggableHandleProps {
    x: number,
    y: number,
    onDragMove?: (x: number, y: number) => void,
    parentOnDragStart?: (h: DraggableHandle) => void,
    parentOnDrop?: (x: number, y: number) => void,
    constraint?: (p: Point2D) => Point2D,
}

function relativeCoords(e: React.MouseEvent, parent: Element) {
    const parentPos = parent.getBoundingClientRect();
    const res = {
        x: e.pageX - (parentPos.left + window.scrollX),
        y: e.pageY - (parentPos.top + window.scrollY),
    }
    return res;
}

/**
 * stateful draggable handle, to be used as part of <svg/>
 */
export class DraggableHandle extends React.Component<DraggableHandleProps> {
    public posRef: Element | null;

    public state = {
        dragging: false,
        drag: { x: 0, y: 0 },
    }

    // mousemove event from outside (delegated from surrounding element)
    public externalMouseMove = (e: React.MouseEvent<SVGElement>): void => {
        this.move(e);
    }

    // mouseleave event from outside (delegated from surrounding element)
    public externalLeave = (e: React.MouseEvent<SVGElement>): void => {
        this.stopDrag(e);
    }

    // mouseup event from outside (delegated from surrounding element)
    public externalMouseUp = (e: React.MouseEvent<SVGElement>): void => {
        this.stopDrag(e);
    }

    public applyConstraint = (p: Point2D) => {
        const { constraint } = this.props;
        if (constraint) {
            return constraint(p);
        } else {
            return p;
        }
    }

    public startDrag = (e: React.MouseEvent<SVGElement>): void => {
        e.preventDefault();
        const { parentOnDragStart } = this.props;
        if (this.posRef) {
            this.setState({
                dragging: true,
                drag: this.applyConstraint(relativeCoords(e, this.posRef)),
            });
            if (parentOnDragStart) {
                parentOnDragStart(this);
            }
        } else {
            throw new Error("startDrag without posRef");
        }
    }

    public move = (e: React.MouseEvent<SVGElement>): void => {
        const { onDragMove } = this.props;
        if (!this.state.dragging) {
            return;
        }
        if (this.posRef) {
            this.setState({
                drag: this.applyConstraint(relativeCoords(e, this.posRef)),
            }, () => {
                if (onDragMove) {
                    const constrained = this.applyConstraint(this.state.drag)
                    onDragMove(constrained.x, constrained.y);
                }
            })
        } else {
            throw new Error("move without posRef");
        }
    }

    public stopDrag = (e: React.MouseEvent<SVGElement>): void => {
        const { parentOnDrop } = this.props;
        const { dragging, drag } = this.state;
        if (!dragging) {
            return;
        }
        this.setState({
            dragging: false,
        })
        if (parentOnDrop) {
            parentOnDrop(drag.x, drag.y);
        }
    }

    public renderDragging() {
        const { x, y } = this.state.drag;
        return this.renderCommon(x, y);
    }

    public renderCommon(x: number, y: number) {
        // empty zero-size <rect> as relative position reference
        return (
            <g>
                <rect
                    style={{ visibility: "hidden" }}
                    ref={e => this.posRef = e}
                    x={0} y={0} width={0} height={0}
                />
                <Handle x={x} y={y}
                    onMouseUp={this.stopDrag}
                    onMouseMove={this.move}
                    onMouseDown={this.startDrag}
                />
            </g>
        );
    }

    public render() {
        const { x, y } = this.props;
        if (this.state.dragging) {
            return this.renderDragging();
        } else {
            return this.renderCommon(x, y);
        }
    }
}

export default DraggableHandle;