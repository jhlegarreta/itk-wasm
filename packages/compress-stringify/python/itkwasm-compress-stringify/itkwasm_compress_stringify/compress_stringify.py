# Generated file. Do not edit.

import os
from typing import Dict, Tuple, Optional, List, Any

from itkwasm import (
    environment_dispatch,
    BinaryStream,
)

def compress_stringify(
    input: bytes,
    stringify: bool = False,
    compression_level: int = 3,
    data_url_prefix: str = "data:base64,",
) -> bytes:
    """Given a binary, compress and optionally base64 encode.

    :param input: Input binary
    :type  input: bytes

    :param stringify: Stringify the output
    :type  stringify: bool

    :param compression_level: Compression level, typically 1-9
    :type  compression_level: int

    :param data_url_prefix: dataURL prefix
    :type  data_url_prefix: str

    :return: Output compressed binary
    :rtype:  bytes
    """
    func = environment_dispatch("itkwasm_compress_stringify", "compress_stringify")
    output = func(input, stringify=stringify, compression_level=compression_level, data_url_prefix=data_url_prefix)
    return output
