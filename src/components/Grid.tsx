import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


const MIN_ANGLE = -90
const MAX_ANGLE = 90

export const W = MAX_ANGLE - MIN_ANGLE + 1
export const H = MAX_ANGLE - MIN_ANGLE + 1
const BOX_SIZE = 15
const GAP = 0
const CELL_STRIDE = BOX_SIZE + GAP
const CANVAS_WIDTH = W * BOX_SIZE + (W - 1) * GAP
const CANVAS_HEIGHT = H * BOX_SIZE + (H - 1) * GAP


type Point = {
    x: number
    y: number
}

function pivotToGrid(point: Point) {
    return {
        column: point.x - MIN_ANGLE,
        row: MAX_ANGLE - point.y,
    }
}

function gridToPivot(column: number, row: number): Point {
    return {
        x: MIN_ANGLE + column,
        y: MAX_ANGLE - row,
    }
}

function pivotToIndex(point: Point): number {
    const { column, row } = pivotToGrid(point)
    return row * W + column
}
export type CellState = {
    x: number
    y: number
    rang: number
    colour: string
}


type HoveredCell = {
    column: number
    row: number
    pivot: Point
    left: number
    top: number
    containerWidth: number
}

const GRID_BACKGROUND_COLOUR = "#18181b"
const DEFAULT_CELL_COLOUR = "#3f3f46"



function buildPivotBoundaryIndexes(min: Point, max: Point): number[] {
    const indexes = new Set<number>()

    for (let x = min.x; x <= max.x; x++) {
        indexes.add(pivotToIndex({ x, y: min.y }))
        indexes.add(pivotToIndex({ x, y: max.y }))
    }

    for (let y = min.y; y <= max.y; y++) {
        indexes.add(pivotToIndex({ x: min.x, y }))
        indexes.add(pivotToIndex({ x: max.x, y }))
    }

    return [...indexes]
}



type gridProp = {
    setRoi: (min: Point, max: Point) => void
    move_pos: (point: Point) => void
}

export default function Grid({ setRoi, move_pos }: gridProp) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const lastHoveredCell = useRef<string | null>(null)
    const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)
    const [selectedPoint, setSelectedPoint] = useState<{ p1: Point | null, p2: Point | null }>({
        p1: null,
        p2: null
    })
    const [newRoi, setNewRoi] = useState<{ min: Point, max: Point }>({
        min: { x: 0, y: 0 },
        max: { x: 0, y: 0 },
    })

    const [mainCell, setMainCell] = useState<CellState[]>([])

    function build_grid() {

        const canvas = canvasRef.current
        const context = canvas?.getContext("2d")

        if (!canvas || !context) return

        context.fillStyle = GRID_BACKGROUND_COLOUR
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        let currentColour = ""
        mainCell.forEach((cell) => {
            const colour = cell.colour || DEFAULT_CELL_COLOUR
            if (colour !== currentColour) {
                context.fillStyle = colour
                currentColour = colour
            }
            const { column, row } = pivotToGrid(cell)
            const pixelPoint = pointToPixel({ x: column, y: row })

            context.fillRect(
                pixelPoint.x,
                pixelPoint.y,
                BOX_SIZE,
                BOX_SIZE,
            )
        })

    }
    function reset_grid() {
        setNewRoi({
            min: { x: 0, y: 0 },
            max: { x: 0, y: 0 },
        })
        setMainCell(
            Array.from({ length: W * H }, (_, index) => {

                const column = index % W
                const row = Math.floor(index / W)
                const pivot = gridToPivot(column, row)

                return {
                    ...pivot,
                    rang: 0,
                    colour: DEFAULT_CELL_COLOUR,
                }
            }),
        )
    }


    useEffect(() => {
        reset_grid()

    }, [])

    useEffect(() => {
        build_grid()
        // toast.info(`Grid setup with a total ${mainCell.length} of cells.`)
    }, [mainCell])

    function pointToPixel(point: Point): Point {
        return {
            x: point.x * CELL_STRIDE,
            y: point.y * CELL_STRIDE,
        }

    }
    function getCellFromPointer(event: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = event.currentTarget
        const bounds = event.currentTarget.getBoundingClientRect()
        const canvasX = ((event.clientX - bounds.left) / bounds.width) * canvas.width
        const canvasY = ((event.clientY - bounds.top) / bounds.height) * canvas.height
        const column = Math.floor(canvasX / CELL_STRIDE)
        const row = Math.floor(canvasY / CELL_STRIDE)
        const isInsideCell =
            column >= 0 &&
            column < W &&
            row >= 0 &&
            row < H &&
            canvasX - column * CELL_STRIDE < BOX_SIZE &&
            canvasY - row * CELL_STRIDE < BOX_SIZE

        return {
            cell: isInsideCell ? { column, row } : null,
            bounds,
        }
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
        const { cell, bounds } = getCellFromPointer(event)

        if (!cell) {
            handlePointerLeave()
            return
        }

        const { column, row } = cell
        const cellKey = `${column}:${row}`

        if (cellKey === lastHoveredCell.current) return

        lastHoveredCell.current = cellKey
        setHoveredCell({
            column,
            row,
            pivot: gridToPivot(column, row),
            left: event.clientX - bounds.left,
            top: event.clientY - bounds.top,
            containerWidth: bounds.width,
        })
    }

    function handlePointerLeave() {
        lastHoveredCell.current = null
        setHoveredCell(null)
    }

    function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
        const { cell } = getCellFromPointer(event)
        if (!cell) return;
        const pivot = gridToPivot(cell.column, cell.row)

        const index = pivotToIndex(pivot)
        const foundCell = mainCell[index]

        if (!foundCell) return

        if (selectedPoint.p1 === null) {
            // toast.success(`Point 1 selected (${foundCell.x}, ${foundCell.y})`, { duration: 1000 })
            setSelectedPoint(pre => ({ ...pre, p1: { x: foundCell.x, y: foundCell.y } }))
            return
        }
        if (selectedPoint.p2 === null) {
            reset_grid()

            // toast.success(`Point 2 selected (${foundCell.x}, ${foundCell.y})`, { duration: 1000 })
            const point2 = {
                x: foundCell.x,
                y: foundCell.y,
            }
            const point1 = {
                x: selectedPoint.p1.x,
                y: selectedPoint.p1.y,
            }

            setSelectedPoint(previous => ({
                ...previous,
                p2: point2,
            }))

            const minX = Math.min(point1.x, point2.x)
            const maxX = Math.max(point1.x, point2.x)

            const minY = Math.min(point1.y, point2.y)
            const maxY = Math.max(point1.y, point2.y)
            setNewRoi({
                max: { x: maxX, y: maxY },
                min: { x: minX, y: minY }
            })

            const fullIndexMap = buildPivotBoundaryIndexes(
                { x: minX, y: minY },
                { x: maxX, y: maxY },
            )



            setMainCell(pre => {
                const next = [...pre]

                for (let index = 0; index < next.length; index++) {
                    const cell = next[index]
                    next[index] = {
                        ...cell,
                        colour: DEFAULT_CELL_COLOUR,
                    }

                }

                for (const cellIndex of fullIndexMap) {
                    const cell = next[cellIndex]
                    if (!cell) continue

                    next[cellIndex] = {
                        ...cell,
                        colour: "#6e278a",
                    }
                }



                return next
            })








        }





    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-2 sm:p-3">

            <div className="flex w-full flex-wrap items-center justify-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <div className=" flex flex-row gap-1.5 items-center">
                        <p>Point 1</p>
                        <Badge variant={selectedPoint.p1 ? "secondary" : "destructive"}>
                            {selectedPoint.p1
                                ? `(${selectedPoint.p1.x} , ${selectedPoint.p1.y})`
                                : "No Point"}
                        </Badge>
                    </div>

                    <div className=" flex flex-row gap-1.5 items-center">
                        <p>Point 2</p>
                        <Badge variant={selectedPoint.p2 ? "secondary" : "destructive"}>
                            {selectedPoint.p2
                                ? `(${selectedPoint.p2.x} , ${selectedPoint.p2.y})`
                                : "No Point"}
                        </Badge>
                    </div>

                </div>
                <Button
                    onClick={() => {
                        setSelectedPoint({
                            p1: null,
                            p2: null
                        })
                        reset_grid()
                    }}
                >
                    Clear
                </Button>
                {(selectedPoint.p1 && selectedPoint.p2) && (<>
                    <Button disabled={selectedPoint.p1 === null || selectedPoint.p2 === null} onClick={() => {
                        setRoi(
                            newRoi.min,
                            newRoi.max,
                        )


                    }}>
                    Set ROI
                    </Button>
                </>)}

                {selectedPoint.p1 && (<>
                        <Button 
                        onClick={()=>{
                            if (!selectedPoint.p1) return;
                            move_pos(selectedPoint.p1)

                        }}

                        >
                            Move to point
                        </Button>
                
                
                </>)}





            </div>



            <div className="relative aspect-square w-full max-w-190 overflow-hidden rounded-md border bg-muted shadow-sm">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    aria-label={`${W} by ${H} LiDAR grid`}
                    className="block size-full cursor-crosshair [image-rendering:pixelated]"
                    onClick={handleClick}
                    onPointerLeave={handlePointerLeave}
                    onPointerMove={handlePointerMove}
                />

                {hoveredCell && (
                    <>
                        <div
                            className="pointer-events-none absolute z-10 ring-1 ring-amber-400"
                            style={{
                                left: `${(hoveredCell.column * CELL_STRIDE * 100) / CANVAS_WIDTH}%`,
                                top: `${(hoveredCell.row * CELL_STRIDE * 100) / CANVAS_HEIGHT}%`,
                                width: `${(BOX_SIZE * 100) / CANVAS_WIDTH}%`,
                                height: `${(BOX_SIZE * 100) / CANVAS_HEIGHT}%`,
                            }}
                        />
                        <div
                            className=" flex flex-col gap-1.5 pointer-events-none absolute z-20 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10"
                            style={{
                                left: Math.max(
                                    4,
                                    Math.min(hoveredCell.left + 12, hoveredCell.containerWidth - 76),
                                ),
                                top: Math.max(hoveredCell.top - 34, 4),
                            }}
                        >
                            <Badge>
                                ({hoveredCell.pivot.x}, {hoveredCell.pivot.y})
                            </Badge>
                            <Badge>
                                {pivotToIndex(hoveredCell.pivot)}
                            </Badge>

                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
