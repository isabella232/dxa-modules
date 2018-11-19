package com.sdl.dxa.modules.model.TSI2844ext;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sdl.webapp.common.api.mapping.semantic.annotations.SemanticEntities;
import com.sdl.webapp.common.api.mapping.semantic.annotations.SemanticEntity;
import com.sdl.webapp.common.api.mapping.semantic.annotations.SemanticProperty;
import com.sdl.webapp.common.api.model.PageModel;
import com.sdl.webapp.common.api.model.page.DefaultPageModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

import static com.sdl.webapp.common.api.mapping.semantic.config.SemanticVocabulary.SDL_CORE;

@Data
@EqualsAndHashCode(callSuper = true)
@SemanticEntity(entityName = "FolderSchema", vocabulary = SDL_CORE, prefix = "f")
public class Tsi2844extPageModel extends DefaultPageModel {

    @SemanticProperty("f:folderMetadataTextField")
    @JsonProperty("FolderMetadataTextField")
    private String folderMetadataTextField;
}