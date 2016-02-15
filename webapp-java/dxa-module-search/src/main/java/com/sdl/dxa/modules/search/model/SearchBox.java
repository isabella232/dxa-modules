package com.sdl.dxa.modules.search.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sdl.webapp.common.api.model.entity.AbstractEntityModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchBox extends AbstractEntityModel {

    @JsonProperty("ResultsLink")
    private String resultsLink;

    @JsonProperty("SearchBoxPlaceholderText")
    private String searchBoxPlaceholderText;
}
