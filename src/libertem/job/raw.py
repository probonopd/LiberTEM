import logging

import numpy as np

from .base import Job, Task


log = logging.getLogger(__name__)


class PickFrameJob(Job):
    def __init__(self, slice_, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._slice = slice_

    def get_tasks(self):
        for partition in self.dataset.get_partitions():
            if self._slice.intersection_with(partition.slice).is_null():
                continue
            yield PickFrameTask(partition=partition, slice_=self._slice)

    def get_result_shape(self):
        return self._slice.shape


class PickFrameTask(Task):
    def __init__(self, slice_, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._slice = slice_

    def _get_dest_slice(self, intersection):
        tile_slice = intersection.get()
        return (
            Ellipsis,
            tile_slice[2],
            tile_slice[3],
        )

    def __call__(self):
        result = np.zeros(self._slice.shape, dtype=self.partition.dtype)
        for data_tile in self.partition.get_tiles():
            intersection = data_tile.tile_slice.intersection_with(self._slice)
            if intersection.is_null():
                continue
            shifted = intersection.shift(data_tile.tile_slice)
            result[
                self._get_dest_slice(intersection)
            ] = data_tile.data[shifted.get()]
        return [PickFrameResultTile(data=result)]


class PickFrameResultTile(object):
    def __init__(self, data):
        self.data = data

    @property
    def dtype(self):
        return self.data.dtype

    def copy_to_result(self, result):
        out = result.reshape(self.data.shape)
        out += self.data
        return result
