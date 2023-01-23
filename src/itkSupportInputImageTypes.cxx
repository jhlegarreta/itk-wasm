/*=========================================================================
 *
 *  Copyright NumFOCUS
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         https://www.apache.org/licenses/LICENSE-2.0.txt
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *=========================================================================*/
#include "itkSupportInputImageTypes.h"
#include "itkWasmExports.h"

#include "rapidjson/document.h"

namespace itk
{

namespace wasm
{

bool lexical_cast(const std::string &input, InterfaceImageType & imageType)
{
  if (wasm::Pipeline::get_use_memory_io())
  {
#ifndef ITK_WASM_NO_MEMORY_IO
    const unsigned int index = std::stoi(input);
    auto json = getMemoryStoreInputJSON(0, index);
    rapidjson::Document document;
    if (document.Parse(json.c_str()).HasParseError())
      {
      throw std::runtime_error("Could not parse JSON");
      }

    const rapidjson::Value & jsonImageType = document["imageType"];
    imageType.dimension = jsonImageType["dimension"].GetInt();
    imageType.componentType = jsonImageType["componentType"].GetString();
    imageType.pixelType = jsonImageType["pixelType"].GetString();
    imageType.components = jsonImageType["components"].GetInt();
#else
    return false;
#endif
  }
  else
  {
#ifndef ITK_WASM_NO_FILESYSTEM_IO
    ImageIOBase::Pointer imageIO = ImageIOFactory::CreateImageIO(input.c_str(), CommonEnums::IOFileMode::ReadMode);
    imageIO->SetFileName(input);
    imageIO->ReadImageInformation();

    imageType.dimension = imageIO->GetNumberOfDimensions();

    using IOComponentType = itk::IOComponentEnum;
    const IOComponentType ioComponentEnum = imageIO->GetComponentType();
    imageType.componentType = WasmComponentTypeFromIOComponentEnum( ioComponentEnum );

    using IOPixelType = itk::IOPixelEnum;
    const IOPixelType ioPixelEnum = imageIO->GetPixelType();
    imageType.pixelType = WasmPixelTypeFromIOPixelEnum( ioPixelEnum );

    imageType.components = imageIO->GetNumberOfComponents();
#else
    return false;
#endif
  }
  return true;
}

} // end namespace wasm
} // end namespace itk
