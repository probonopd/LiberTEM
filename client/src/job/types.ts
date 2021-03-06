
export interface JobResultType {
    imageURL: string,
    description: { title: string, desc: string },
}

export interface JobState {
    id: string,
    dataset: string,
    running: "CREATING" | "RUNNING" | "DONE",
    status: "CREATING" | "IN_PROGRESS" | "CANCELLED" | "SUCCESS",
    results: JobResultType[],
    startTimestamp: number,
    endTimestamp: number,
}